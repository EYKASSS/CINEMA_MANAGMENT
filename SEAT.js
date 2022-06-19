let seat;

class Facility {
	static async injectDB(conn) {
        seat = await conn.db("cms").collection("seats")
	}

    static async createSeat(param) {
		console.log(param);
		let seats = await seat.find({ seat_no: param.seat_no }).toArray()
        console.log(seats)
            if (seats.length > 0) {
                return false;
            } else {
                let output = await seat.insertOne({ 
                    seat_no: param.seat_no, 
                    name: param.name, 
                    location: param.location, 
                    max_number_customer: param.max_number_customer, 
                    manager_id: param.manager_id 
                })
                console.log('Seat info created:'+ output)
                return seat.find({ seat_no: param.seat_no }).toArray()
            }
	}

	static async getSeat(name) {
		// TODO: Find seats
        let seats = await seat.find({"name": {$regex: name, $options: "i"}}).toArray();
        console.log(seats)
        if( seats.length == 0){
            return null;
        } else {
            return seats;
        }
	}

    static async updateSeat(seat_no, name, location, operating_hour, max_no_customer, manager_id) {
        // TODO: Check seats
        let seats = await seat.find({ '$and': [{'seat_no': seat_no}, {'manager_id': manager_id}] }).toArray();
        console.log(seats)
        if (seats.length == 0) {
            return null;
        }
        else {
            let output = await seat.updateOne({ seat_no: seat_no }, 
                { $set: { 
                    name: name, 
                    location: location, 
                    operating_hour: operating_hour, 
                    max_no_customer: max_no_customer 
                } 
            })
            return seat.find({ seat_no: seat_no }).toArray()
        }
    }

    static async deleteSeat(seat_no) {
        let seats = await seat.find({ seat_no: seat_no }).toArray();
        if (seats.length == 0) {
            return false;
        }
        else {
            let output = await seat.deleteOne({ seat_no: seat_no })
            console.log[output, "deleted"]
            return true;
        }
    }
}

module.exports = Seat;
