let booking, seat;

class Booking {
	static async injectDB(conn) {
        booking = await conn.db("cms").collection("booking_request")
        seat = await conn.db("cms").collection("seats")
	}


    static async BookingandReservation(seat_no, customer_id, time_slot) {
        let i,ii;
		// TODO: Check if current booking is full
        let result = await booking.find(
            {seat_no: seat_no, time_slot: time_slot}).toArray();

        let seats = await seat.find(
            {seat_no: seat_no}).toArray();

            console.log("Number of bookings: "+result.length+"   Maximum Number of bookings: "+seats[0].max_no_customer);
        if(result.length <= seats[0].max_no_customer){
            i = true;
            console.log("Booking is available");
        } else {
            i =  false;
            console.log("Booking is full");
        }

        // TODO: Check if duplicate booking
        let result2 = await booking.find(
            {seat_no: seat_no, time_slot: time_slot, customer_id: customer_id}).toArray();
        if(result2.length == 0){
            ii =  true;
            console.log("You may book this seat");
        } else {
            ii =  false;
            console.log("You have already booked this seat");
        }

		// TODO: Save booking request to database
        if(i && ii){
            await booking.insertOne({
                seat_no: seat_no,
                customer_id: customer_id,
                time_slot: time_slot
            })
        } else {
            return false
        };

        return booking.find({
            seat_no: seat_no,
            customer_id: customer_id,
            time_slot: time_slot
        }).toArray()
	}

    static async queryBooking(seat_no) {
        // TODO: Query booking request
        let result = await booking.find({seat_no: seat_no}).toArray();
        if(result.length > 0){
            console.log("Booking request found");
            return result;
        } else {
            return null;
        }
    }
}



module.exports = Booking;


