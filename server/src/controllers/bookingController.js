import Joi from 'joi';
import { Booking } from '../models/Booking.js';

// TODO: write a validation schema for create/update per README.md section 2.
const bookingDateOrderRule = (value, helpers) => {
  const { startDate, endDate } = value;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return helpers.message('startDate must be earlier than endDate');
  }

  return value;
};

const createSchema = Joi.object({
  roomNumber: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
}).custom(bookingDateOrderRule);

const updateSchema = Joi.object({
  roomNumber: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date(),
}).custom(bookingDateOrderRule);



// TODO: per README.md section 4, you will need a way to detect whether a
// proposed booking conflicts with an existing one on the same room.

// GET /api/bookings
// TODO: implement per README.md section 3.
export async function getAllBookings(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}

// GET /api/bookings/:id
// TODO: implement per README.md sections 3 and 5.
export async function getBooking(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}

// POST /api/bookings
// TODO: implement per README.md sections 3 and 4.
export async function createBooking(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}

// PATCH /api/bookings/:id
// TODO: implement per README.md sections 3, 4, and 5.
export async function updateBooking(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}

// DELETE /api/bookings/:id
// TODO: implement per README.md sections 3 and 5.
export async function deleteBooking(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}
