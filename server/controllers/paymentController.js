import axios from "axios";
import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

const getClientUrl = () => {
  return process.env.CLIENT_URL || 'http://localhost:5175';
};

export const sslSuccess = async (req, res) => {
  const clientUrl = getClientUrl();

  try {
    const val_id = req.body.val_id || req.query.val_id;
    if (!val_id) {
      return res.redirect(`${clientUrl}/my-bookings`);
    }

    const validation = await axios.get(
      `${process.env.SSLC_BASE_URL}/validator/api/validationserverAPI.php`,
      {
        params: {
          val_id,
          store_id: process.env.SSLCOMMERZ_STORE_ID,
          store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
          format: "json"
        }
      }
    );

    const data = validation.data;
    if (data.status === "VALID" || data.status === "VALIDATED") {
      const bookingId = data.value_a;
      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentLink: ""
      });

      await inngest.send({
        name: "app/show.booked",
        data: { bookingId }
      });

      return res.redirect(`${clientUrl}/payment-success`);
    }

    return res.redirect(`${clientUrl}/my-bookings`);
  } catch (error) {
    console.error("SSL Success Error:", error.message);
    return res.redirect(`${clientUrl}/my-bookings`);
  }
};

export const sslFail = async (req, res) => {
  const clientUrl = getClientUrl();
  return res.redirect(`${clientUrl}/my-bookings`);
};

export const sslCancel = async (req, res) => {
  const clientUrl = getClientUrl();
  return res.redirect(`${clientUrl}/my-bookings`);
};