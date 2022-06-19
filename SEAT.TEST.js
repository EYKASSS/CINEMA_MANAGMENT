const MongoClient = require("mongodb").MongoClient;
const Seat = require("./SEAT_info");

describe("SEAT_TEST", () => {
    let client;
    beforeAll(async () => {
        client = await MongoClient.connect(
            "mongodb+srv://m001-student:m001-student@sandbox.igzzp.mongodb.net/cms?retryWrites=true&w=majority",
            { useNewUrlParser: true },
        );
        Seat.injectDB(client);
    })

    afterAll(async () => {
        await client.close();
    })
    
    //Test if new seat is created in the database
    test("Create new seat", async () => {
        const res = await Seat.create_facility_info("004","3rd hall","10:00 to 20:00",50,"6281f89e3de33fd8283f7228")
        console.log(res)
        expect(res[0].facilities_id).toBe("004")
        })
    //Test if a seat is in the database
    test("Get seat", async () => {
        const res = await Seat.getFacilities("hall")
        expect(res[0].name).toBe("hall")
        })
    //Test if a seat is updated in the database
    test("Update seat", async () => {
        const res = await Seat.update_facility_info("004","4rd hall","10:00 to 20:00",30,"6281f89e3de33fd8283f7228")
        expect(res[0].name).toBe("hall4")
        })
        
});