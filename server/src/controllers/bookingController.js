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
  purpose: Joi.string(),
  bookedBy: Joi.string()
}).custom(bookingDateOrderRule);

const updateSchema = Joi.object({
  roomNumber: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date(),
  purpose: Joi.string(),
  bookedBy: Joi.string()

}).custom(bookingDateOrderRule);

function publicBooking(b) {
  return {
    id: b._id.toString(),
    roomNumber: b.roomNumber,
    startDate: b.startDate,
    endDate: b.endDate,
    purpose: b.purpose,
    bookedBy: b.bookedBy
      ? {
        id: b.bookedBy._id?.toString?.() ?? b.bookedBy.toString(),
        name: b.bookedBy.name,
        email: b.bookedBy.email
      }
      : null,
    createdAt: b.createdAt
  };
}

// TODO: per README.md section 4, you will need a way to detect whether a
// proposed booking conflicts with an existing one on the same room.

// GET /api/bookings
// TODO: implement per README.md section 3.
export async function getAllBookings(req, res, next) {
  try {
    const bookings = await Booking.find()
      .populate({ path: 'bookedBy', select: 'name email' })
      .sort({ createdAt: -1 });
    res.json({ bookings: bookings.map(publicBooking) });
  } catch (err) { next(err); }
}

// GET /api/bookings/:id
// TODO: implement per README.md sections 3 and 5.
export async function getBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'bookedBy', select: 'name email' });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ booking: publicBooking(booking) });
  } catch (err) { next(err); }
}

// POST /api/bookings
// TODO: implement per README.md sections 3 and 4.
export async function createBooking(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const existing = await Booking.findOne({
      roomNumber: value.roomNumber,
      startDate: { $lt: value.endDate },
      endDate: { $gt: value.startDate }
    });
    if (existing) return res.status(409).json({ message: 'Room already booked' });

    const booking = await Booking.create({ roomNumber: value.roomNumber, startDate: value.startDate, endDate: value.endDate, purpose: value.purpose, bookedBy: value.bookedBy });
    await booking.populate({ path: 'bookedBy', select: 'name email' });
    res.status(201).json({ booking: publicBooking(booking) });
  } catch (err) { next(err); }
}

// PATCH /api/bookings/:id
// TODO: implement per README.md sections 3, 4, and 5.
export async function updateBooking(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const currentBooking = await Booking.findById(req.params.id);
    if (!currentBooking) return res.status(404).json({ message: 'Booking not found' });

    const proposedBooking = {
      roomNumber: value.roomNumber ?? currentBooking.roomNumber,
      startDate: value.startDate ?? currentBooking.startDate,
      endDate: value.endDate ?? currentBooking.endDate
    };

    const existing = await Booking.findOne({
      roomNumber: proposedBooking.roomNumber,
      startDate: { $lt: proposedBooking.endDate },
      endDate: { $gt: proposedBooking.startDate }
    });
    if (existing) return res.status(409).json({ message: 'Room already booked' });

    const doc = await Booking.findByIdAndUpdate(req.params.id, { $set: value }, { new: true, runValidators: true })
      .populate({ path: 'bookedBy', select: 'name email' });
    res.json({ booking: publicBooking(doc) });
  } catch (err) { next(err); }
}

// DELETE /api/bookings/:id
// TODO: implement per README.md sections 3 and 5.
export async function deleteBooking(req, res, next) {
  try {
    const doc = await Booking.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Booking not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
}
