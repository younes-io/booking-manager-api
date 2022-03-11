# Booking Manager API

This is a booking manager API that allows users to:

- add tables to the restaurant
- set up the restaurant open hours
- generate bookable timeslots
- add / edit / cancel a reservation

## Installation

Use the package manager [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install the project dependencies :

```bash
npm install
```

## Tests

To run tests, you can type in your terminal :

```bash
npm run test
```

## API docs

The documentation of the Booking Manager API is available on : http://localhost:3000/api/v1/docs
Make sure you run the project first:

```bash
npm run start
```

## Design

![Booking Manager API design](https://raw.githubusercontent.com/younes-io/pix/main/Superb_Exercice.jpg)

Basically, the BMA (Booking Manager API) exposes two types of endpoints

- Setup endpoints : consumed exclusively by the Restaurant Owner (e.g. `POST /tables` to add tables to the restaurant)
- Public endpoints : consumed by customers (e.g. `POST /reservation` to book a table at a timeslot)

The public endpoints being open to the public may experience race conditions and concurrency issues; for instance, we could have the following scenario:

1. User A sees that Table Monaco is free at 20:00
2. User B sees that Table Monaco is free at 20:00
3. Users A and B both click to book Table Monaco at 20:00
4. BMA checks if Table Monaco is free at 20:00 for User A --> YES !!
5. BMA checks if Table Monaco is free at 20:00 for User B --> YES !!
6. BMA books Table Monaco at 20:00 for User A
7. BMA books Table Monaco at 20:00 for User B ------> PROBLEM !!! User A has already booked it, but BMA check showed that the Table Monaco is free at 20:00

This shows that we need a synchronization in our system to make sure all asynchronous requests are being handled in a safe way.

### Writing a formal specification of the problem

The need of a formal specification is justified for this problem :

- The system should manage access (bookings/reservations) to limited resources (tables & timeslots) according to a set of rules, such as availability and synchronization.
- Handling concurrency and resource management can be error prone and thus lead to bugs (design bugs are the worst)

I wrote a first version of the problem (without managing concurrency) : it assumes that, at any time, only one user is sending a request : https://gist.github.com/younes-io/7f6e7aa65a3f593ef91aafa76f9b393e

Then, I wrote another version which tackles the issue of concurrency : many users can initiate requests on the limited resources of the restaurant : https://gist.github.com/younes-io/93619d010dd3a9c4d7485957c18e9f72

After running the model, these are the results for each action :
![enter image description here](https://raw.githubusercontent.com/younes-io/pix/main/BMA_TLA_Model.png)

**N.B**: I have not represented in the specification the actions of adding tables or setting up opening hours because these are setup requests, so I represented them as constants in the sepcification. They also are not concerned by the race conditions / concurrency issues we want to prevent.

### The formal specification helps to find

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
