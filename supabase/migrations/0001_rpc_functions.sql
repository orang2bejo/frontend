-- Function to create a new jastip order
CREATE OR REPLACE FUNCTION create_order(p_order_data jsonb)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_order orders;
BEGIN
  INSERT INTO orders (user_id, item_description, store_location, delivery_address, max_budget, customer_phone, customer_notes)
  VALUES (
    auth.uid(),
    p_order_data->>'item_description',
    p_order_data->>'store_location',
    p_order_data->>'delivery_address',
    (p_order_data->>'max_budget')::numeric,
    p_order_data->>'customer_phone',
    p_order_data->>'customer_notes'
  ) RETURNING * INTO new_order;

  RETURN new_order;
END;
$$;

-- Function for a user to get their own jastip orders
CREATE OR REPLACE FUNCTION get_my_orders()
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM orders
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
$$;

-- Function to get details of a specific order (jastip)
-- Note: In a real app, you might want separate get_order_details_for_customer and get_order_details_for_driver functions
CREATE OR REPLACE FUNCTION get_order_details(p_order_id uuid)
RETURNS orders
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM orders
  WHERE id = p_order_id AND (user_id = auth.uid() OR driver_id = auth.uid());
$$;

-- Transactional function to submit a review and update driver's average rating
CREATE OR REPLACE FUNCTION submit_review_and_update_driver_rating(p_order_id uuid, p_rating int, p_comment text)
RETURNS reviews
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reviewed_order orders;
  new_review reviews;
BEGIN
  -- Get the order details
  SELECT * INTO reviewed_order FROM orders WHERE id = p_order_id AND user_id = auth.uid();

  IF reviewed_order IS NULL THEN
    RAISE EXCEPTION 'Order not found or you are not authorized to review this order.';
  END IF;

  IF reviewed_order.review_submitted THEN
      RAISE EXCEPTION 'Review has already been submitted for this order.';
  END IF;

  -- Insert the review
  INSERT INTO reviews (order_id, user_id, driver_id, rating, comment)
  VALUES (p_order_id, auth.uid(), reviewed_order.driver_id, p_rating, p_comment)
  RETURNING * INTO new_review;

  -- Update the driver's rating
  UPDATE drivers
  SET
    total_orders = total_orders + 1,
    rating = ((rating * (total_orders - 1)) + p_rating) / total_orders
  WHERE id = reviewed_order.driver_id;

  -- Mark the order as reviewed
  UPDATE orders
  SET review_submitted = true
  WHERE id = p_order_id;

  RETURN new_review;
END;
$$;

-- Function to create a specialist order
CREATE OR REPLACE FUNCTION create_specialist_order(p_order_data jsonb)
RETURNS specialist_orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_specialist_order specialist_orders;
BEGIN
  INSERT INTO specialist_orders (customer_id, service_type, problem_description, customer_location, urgency_level)
  VALUES (
    auth.uid(),
    p_order_data->>'service_type',
    p_order_data->>'problem_description',
    (p_order_data->>'customer_location')::jsonb,
    p_order_data->>'urgency_level'
  ) RETURNING * INTO new_specialist_order;

  RETURN new_specialist_order;
END;
$$;

-- Function for a customer to accept a quote
CREATE OR REPLACE FUNCTION accept_specialist_quote(p_quote_id uuid)
RETURNS specialist_orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_quote quotes;
  accepted_order specialist_orders;
BEGIN
  -- Find the quote and ensure the current user is the customer of that order
  SELECT * INTO target_quote FROM quotes WHERE id = p_quote_id;

  IF target_quote IS NULL THEN
    RAISE EXCEPTION 'Quote not found.';
  END IF;

  -- Update the order
  UPDATE specialist_orders
  SET
    status = 'accepted',
    mitra_id = target_quote.mitra_id,
    final_agreed_price = target_quote.quoted_price
  WHERE id = target_quote.order_id AND customer_id = auth.uid()
  RETURNING * INTO accepted_order;

  IF accepted_order IS NULL THEN
    RAISE EXCEPTION 'Order could not be updated. You may not be the customer for this order.';
  END IF;

  RETURN accepted_order;
END;
$$;
