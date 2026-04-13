import axios from "axios";
import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js"


// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats)=>{
    try {
        const showData = await Show.findById(showId)
        if(!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

export const createBooking = async (req, res)=>{
    try {
        const {userId} = req.auth();
        const {showId, selectedSeats} = req.body;

        // Check if the seat is available for the selected show
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats)

        if(!isAvailable){
            return res.json({success: false, message: "Selected Seats are not available."})
        }

        // Get the show details
        const showData = await Show.findById(showId).populate('movie');

        // Create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        })

        selectedSeats.map((seat)=>{
            showData.occupiedSeats[seat] = userId;
        })

        showData.markModified('occupiedSeats');

        await showData.save();

        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const paymentData = {
            store_id: process.env.SSLCOMMERZ_STORE_ID,
            store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
            total_amount: booking.amount,
            currency: "BDT",
            tran_id: booking._id.toString(),
            success_url: `${baseUrl}/api/payment/success`,
            fail_url: `${baseUrl}/api/payment/fail`,
            cancel_url: `${baseUrl}/api/payment/cancel`,
            cus_name: "Customer",
            cus_email: "test@gmail.com",
            cus_add1: "Dhaka",
            cus_phone: "01700000000",
            shipping_method: "NO",
            product_name: showData.movie.title,
            product_category: "Entertainment",
            product_profile: "general",
            value_a: booking._id.toString()
        };

        const response = await axios.post(
            `${process.env.SSLC_BASE_URL}/gwprocess/v4/api.php`,
            new URLSearchParams(paymentData).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const paymentUrl = response.data?.GatewayPageURL;
        if (!paymentUrl) {
            console.error("SSLCOMMERZ init error", {
                status: response.status,
                data: response.data
            });
            return res.json({
                success: false,
                message: "Unable to initialize SSLCOMMERZ payment.",
                details: response.data
            });
        }

        booking.paymentLink = paymentUrl;
        await booking.save();

        await inngest.send({
            name: "app/checkpayment",
            data: {
                bookingId: booking._id.toString()
            }
        });

        res.json({success: true, url: paymentUrl});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const getOccupiedSeats = async (req, res)=>{
    try {
        
        const {showId} = req.params;
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)

        res.json({success: true, occupiedSeats})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}