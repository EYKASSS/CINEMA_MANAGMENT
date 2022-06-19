let customer;

class Customer {
	static async injectDB(conn) {
		customer = await conn.db("cms").collection("customer")
	}

    static async create_customer(name, seat_no, hp) {
		// TODO: Customer already exists
        let document = await customer.find({seat_no: seat_no}).toArray();

        if( document.length > 0){
            return false
        } else {
        // TODO: Save new customer to database
            await customer.insertOne({
                name: name,
                seat_no: seat_no,
                hp: hp,
            })
            return customer.find({seat_no: seat_no}).toArray()
        }
	}

    static async getCustomer(seat_no) {
        let customer = await customer.find({seat_no: seat_no}).toArray();
        console.log(customer);
		if(customer.length > 0){
            return customer;
        } else {
            return null;
        }
	}
 }

module.exports = Customer;