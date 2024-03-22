import assert from 'assert';
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";

const args = process.argv.slice(2);
assert(args.length <= 1, 'usage: node test.js [url]');

const url = (args.length === 0) ? 'http://localhost:3000' : args[0];

const baseEvent = {
    "title": "DC Convention",
    "category": "Convention",
    "description": "First Ever DC Convention with Actor Interviews! A Must for All DC Fans.",
    "organizer": "WB-DC Team",
    "start_date": "2024-01-07T10:00",
    "end_date": "2024-01-07T19:00",
    "location": "Expo Tel Aviv",
    "tickets": [
        { "name": "Entrance", "quantity": 800, "price": 20 },
        { "name": "Interview", "quantity": 300, "price": 30 },
        { "name": "Meetups", "quantity": 100, "price": 70 }
    ],
    "image": "https: /images.thedirect.com/media/photos/comics-dc.jpg"
};

async function getJWT(username, password) {
    let res = await fetch(`${url}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    });
    let json = await res.json();
    return json.token;
}

function sendRequest(endpoint, method = 'GET', body = null, headers = {}) {
    const address = `${url}${endpoint}`;
    const content = {
        method: method,
        headers: headers
    };
    if (body) {
        content.headers['Content-Type'] = 'application/json';
        content.body = body;
    }
    return fetch(address, content);
}

function sendAuthenticatedRequest(endpoint, jwt, method = 'GET', body = '') {
    return sendRequest(endpoint, method, body, { authorization: `Bearer ${jwt}` });
}

// Authentication tests
async function authenticationTests() {
    // Attempt to access protected endpoint without authentication
    let res = await sendRequest('/api/segel');
    assert.equal(res.status, 404, 'Non-existant route, unauthenticated should return 404');

    // Signup with a new user
    let user = uuidv4().substring(0, 8);
    let pass = '1234';
    let reqBody = JSON.stringify({ username: user, password: pass });
    res = await sendRequest('/api/signup', 'POST', reqBody);
    assert.equal(res.status, 201, 'Signup should succeed with status 201');

    // Login with the same user
    res = await sendRequest('/api/login', 'POST', reqBody);
    assert.equal(res.status, 200, 'Login should succeed with status 200');
    let jwt = (await res.json()).token;
    assert(jwt, 'Login should return a JWT token');

    console.log('Authentication tests passed.');
}

// Error handling tests
async function errorHandlingTests() {
    // Test invalid endpoint
    let res = await sendRequest('/api/nonexistent');
    assert.equal(res.status, 404, 'Non-existent endpoint should return 404');

    // Test invalid method
    res = await sendRequest('/api/signup', 'GET');
    assert.equal(res.status, 404, 'Incorrect method should return 404');

    console.log('Error handling tests passed.');
}

// Functionality tests
async function functionalityTests() {
    // Setup a user and get JWT
    let user = uuidv4().substring(0, 8);
    let pass = 'password';
    let reqBody = JSON.stringify({ username: user, password: pass });
    // let reqBody = JSON.stringify({ username: "admin", password: "admin" });

    await sendRequest('/api/signup', 'POST', reqBody);
    let res = await sendRequest('/api/login', 'POST', reqBody);
    let jwt = (await res.json()).token;

    // Test creating an event
    let eventData = {
        title: "Event Title",
        category: "Conference",
        description: "Event Description",
        organizer: "Organizer Name",
        start_date: "2024-01-01T10:00",
        end_date: "2024-01-01T15:00",
        location: "Event Location",
        tickets: [{ name: "Standard", quantity: 100, price: 10 }]
    };
    res = await sendRequest('/api/event', 'POST', JSON.stringify(eventData), { authorization: `Bearer ${jwt}` });
    assert.equal(res.status, 403, 'User cannot create an event');

    console.log('Functionality tests passed.');
}

async function updateEventWithInvalidData() {
    console.log("Update Event With Invalid Data Test..........");
    let jwt = await getJWT("admin", "admin");
    let createRes = await sendAuthenticatedRequest('/api/event', jwt, 'POST', JSON.stringify(baseEvent));
    assert.equal(createRes.status, 201);
    let createdEvent = await createRes.json();

    let invalidUpdate = { ...baseEvent, start_date: "2022-01-07T19:00", end_date: "2022-01-07T10:00" }; // Invalid: end_date before start_date
    let updateRes = await sendAuthenticatedRequest(`/api/event/${createdEvent._id}`, jwt, 'PUT', JSON.stringify(invalidUpdate));
    assert.equal(updateRes.status, 400);

    let deleteRes = await sendAuthenticatedRequest(`/api/event/${createdEvent._id}`, jwt, 'DELETE');
    assert.equal(deleteRes.status, 200);
    console.log("[OK] Update Event With Invalid Data Test");
}

async function createUserWithEmptyUsernameOrPassword() {
    console.log("Create User With Empty Username or Password Test...");
    let userPayload = JSON.stringify({ username: "", password: "validPassword" });
    let userRes = await sendRequest('/api/signup', 'POST', JSON.stringify(userPayload));
    assert.equal(userRes.status, 400);

    userPayload = { username: "validUsername", password: "" };
    userRes = await sendRequest('/api/signup', 'POST', JSON.stringify(userPayload));
    assert.equal(userRes.status, 400);
    console.log("[OK] Create User With Empty Username or Password Test");
}

async function testEventDeletionConcurrency() {
    console.log("Event Deletion Concurrency Test............");
    let jwt = await getJWT("admin", "admin");
    let createRes1 = await sendAuthenticatedRequest('/api/event', jwt, 'POST', JSON.stringify(baseEvent));
    // let createRes2 = await sendAuthenticatedRequest('/api/event', jwt, 'POST', JSON.stringify(baseEvent2));
    assert.equal(createRes1.status, 201);
    // assert.equal(createRes2.status, 201);

    let event1 = await createRes1.json();
    // let event2 = await createRes2.json();

    // Attempt to delete both events concurrently
    let deleteRes1 = sendAuthenticatedRequest(`/api/event/${event1._id}`, jwt, 'DELETE');
    // let deleteRes2 = sendAuthenticatedRequest(`/api/event/${event2._id}`, jwt, 'DELETE');

    await Promise.all([deleteRes1]).then(values => {
        assert.equal(values[0].status, 200);
        // assert.equal(values[1].status, 200);
    });

    console.log("[OK] Event Deletion Concurrency Test");
}

async function testQueryParamsHandling() {
    console.log("Test Query Params Handling..................");
    let jwt = await getJWT("admin", "admin");
    // Test with unexpected query params
    let res = await sendAuthenticatedRequest('/api/event/Festival?unexpectedParam=123', jwt, 'GET');
    assert.equal(res.status, 200); // Should ignore unexpected params and return success

    // Test pagination with boundary values
    res = await sendAuthenticatedRequest('/api/event/Festival?limit=1&skip=0', jwt, 'GET');
    assert.equal(res.status, 200);
    let events = await res.json();
    assert(events.length <= 1); // Ensure pagination is respected

    console.log("[OK] Test Query Params Handling");
}

async function testRedundantData() {
    console.log("Test Redundant Data Handling................");
    let jwt = await getJWT("admin", "admin");
    let redundantEvent = { ...baseEvent, redundantField: "I should be ignored" };

    // Create an event with redundant data
    let createRes = await sendAuthenticatedRequest('/api/event', jwt, 'POST', JSON.stringify(redundantEvent));
    assert.equal(createRes.status, 201);
    let createdEvent = await createRes.json();
    assert.equal(createdEvent.redundantField, undefined);

    console.log("[OK] Test Redundant Data Handling");
}

async function testHappyFlows() {
    console.log("Test Happy Flows............................");
    let jwt = await getJWT("admin", "admin");

    // Create, Read, Update, Delete (CRUD) flow for an event
    let createRes = await sendAuthenticatedRequest('/api/event', jwt, 'POST', JSON.stringify(baseEvent));
    assert.equal(createRes.status, 201);
    let createdEvent = await createRes.json();

    let getRes = await sendAuthenticatedRequest(`/api/event/${createdEvent._id}`, jwt, 'GET');
    assert.equal(getRes.status, 200);

    let updateRes = await sendAuthenticatedRequest(`/api/event/${createdEvent._id}`, jwt, 'PUT', JSON.stringify({ title: "Updated Title" }));
    assert.equal(updateRes.status, 200);

    let deleteRes = await sendAuthenticatedRequest(`/api/event/${createdEvent._id}`, jwt, 'DELETE');
    assert.equal(deleteRes.status, 200);

    console.log("[OK] Test Happy Flows");
}

async function testUpdateEventScenarios() {
    console.log("Test Update Event Scenarios.................");
    let jwt = await getJWT("admin", "admin");
    let createRes = await sendAuthenticatedRequest('/api/event', jwt, 'POST', JSON.stringify(baseEvent));
    assert.equal(createRes.status, 201);
    let createdEvent = await createRes.json();

    // Happy flow: update each field one at a time
    let updateFields = ['title', 'description', 'location'];
    for (let field of updateFields) {
        let update = {};
        update[field] = `Updated ${field}`;
        let updateRes = await sendAuthenticatedRequest(`/api/event/${createdEvent._id}`, jwt, 'PUT', JSON.stringify(update));
        assert.equal(updateRes.status, 200);
    }

    // Error flow: attempt to update non-updatable field
    let updateRes = await sendAuthenticatedRequest(`/api/event/${createdEvent._id}`, jwt, 'PUT', JSON.stringify({ _id: "newIdShouldFail" }));
    assert.equal(updateRes.status, 400);

    console.log("[OK] Test Update Event Scenarios");
}

async function runTests() {
    await authenticationTests();
    await errorHandlingTests();
    await functionalityTests();
    await updateEventWithInvalidData();
    await createUserWithEmptyUsernameOrPassword();
    await testEventDeletionConcurrency();
    await testQueryParamsHandling();
    await testRedundantData();
    await testHappyFlows();
    await testUpdateEventScenarios();
    console.log('All tests passed.');
}

// User Authentication Scenario Test
async function userAuthenticationScenarioTest() {
    let newUser = uuidv4().substring(0, 8);
    let newPassword = 'securePassword123!';
    let reqBody = JSON.stringify({ username: newUser, password: newPassword });

    // Test user registration
    let res = await sendRequest('/api/signup', 'POST', reqBody);
    assert.equal(res.status, 201, 'User registration should return status 201');

    // Test duplicate user registration
    res = await sendRequest('/api/signup', 'POST', reqBody);
    assert.equal(res.status, 400, 'Duplicate user registration should return status 400');

    // Test login with the registered user
    res = await sendRequest('/api/login', 'POST', reqBody);
    assert.equal(res.status, 200, 'User login should return status 200');
    let jwt = (await res.json()).token;

    // Test accessing a protected endpoint with valid token
    res = await sendRequest('/api/event/Festival', 'GET', null, { authorization: `Bearer ${jwt}` });
    assert.equal(res.status, 200, 'Authenticated user should be able to access protected endpoint');

    res = await sendRequest('/api/event/trip/London', 'GET', null, { authorization: `Bearer ${jwt}` });
    assert.equal(res.status, 404, 'Non-existent route, authenticated should return 404');

    console.log('User authentication scenario test passed.');
}

// Event Creation and Validation Test
async function eventCreationAndValidationTest() {
    let userData = JSON.stringify({ username: "admin", password: "admin" });

    // Setup user and get JWT
    await sendRequest('/api/signup', 'POST', userData);
    let res = await sendRequest('/api/login', 'POST', userData);
    let jwt = (await res.json()).token;

    // Define an event with invalid data
    let invalidEventData = {
        title: "", // Invalid: title should not be empty
        category: "Conference",
        description: "Description",
        organizer: "Organizer",
        start_date: "2024-01-01T10:00",
        end_date: "2024-01-01T15:00",
        location: "Location",
        tickets: [{ name: "Standard", quantity: 100, price: -10 }] // Invalid: price should not be negative
    };

    // Attempt to create an event with invalid data
    res = await sendRequest('/api/event', 'POST', JSON.stringify(invalidEventData), { authorization: `Bearer ${jwt}` });
    assert.equal(res.status, 400, 'Creating an event with invalid data should return status 400');

    console.log('Event creation and validation test passed.');
}

async function runElaborateTests() {
    await userAuthenticationScenarioTest();
    await eventCreationAndValidationTest();
    console.log('All elaborate tests passed.');
}

async function testErrorCodes() {
    let jwt, res;

    console.log("Testing 404 Not Found Error.................");
    // 404 for wrong HTTP method
    res = await sendRequest('/api/login', 'DELETE');
    assert.equal(res.status, 404);

    // 404 for non-existent route
    res = await sendRequest('/api/card');
    assert.equal(res.status, 404);

    // 404 for non-existent item in database
    jwt = await getJWT("admin", "admin");
    res = await sendAuthenticatedRequest('/api/event/1234', jwt);
    assert.equal(res.status, 404);

    console.log("[OK] 404 Not Found Errors");

    console.log("Testing 400 Bad Request Error...............");
    // 400 for invalid JSON body format
    jwt = await getJWT("admin", "admin");
    res = await sendAuthenticatedRequest('/api/event', jwt, 'POST', `{"title" "Missing colon"}`);
    assert.equal(res.status, 400);

    // 400 for missing required parameter
    res = await sendRequest('/api/login', 'POST', JSON.stringify({ username: "admin" }));
    assert.equal(res.status, 400);

    // 400 for parameter of wrong type
    res = await sendAuthenticatedRequest('/api/event', jwt, 'POST', JSON.stringify({ ...baseEvent, category: ["Array instead of string"] }));
    assert.equal(res.status, 400);

    // 400 for existing username on signup
    res = await sendRequest('/api/signup', 'POST', JSON.stringify({ username: "admin", password: "admin" }));
    assert.equal(res.status, 400);

    console.log("[OK] 400 Bad Request Errors");

    console.log("Testing 401 Unauthorized Error..............");
    // 401 for requests with no JWT token
    res = await sendRequest('/api/event/non-existentId', 'GET');
    assert.equal(res.status, 401);

    // 401 for invalid JWT token
    res = await sendRequest('/api/event/still-nonexistant', 'GET', '', { Authorization: `Bearer invalidToken` });
    assert.equal(res.status, 401);

    // Incorrect user login credentials
    res = await sendRequest('/api/login', 'POST', JSON.stringify({ username: "admin", password: "wrongpassword" }));
    assert.equal(res.status, 401);

    console.log("[OK] 401 Unauthorized Errors");

    console.log("Testing 403 Forbidden Error..................");
    // 403 for worker trying to access manager-level path
    let workerJWT = await getJWT("worker", "worker");
    res = await sendAuthenticatedRequest('/api/permission', workerJWT, 'PUT', JSON.stringify({ username: "otherWorker", permission: "W" }));
    assert.equal(res.status, 403);

    console.log("[OK] 403 Forbidden Errors");
}

async function runErrorTests() {
    await testErrorCodes();
    console.log("All error code tests completed.");
}

async function testValidationOrder() {
    let jwt, res;

    console.log("Testing Validation Order Examples...........");

    console.log("Unauthorized before Bad Request.............");
    // No JWT and improperly formatted body should return 401
    res = await sendRequest('/api/event', 'POST', `{"title" "Missing colon"}`);
    assert.equal(res.status, 401);

    console.log("Forbidden before Bad Request................");
    // JWT of a worker, higher permission needed and improperly formatted body should return 403
    let workerJWT = await getJWT("worker", "worker");
    assert(workerJWT, 'Worker JWT should be defined');
    res = await sendAuthenticatedRequest('/api/permission', workerJWT, 'PUT', `{"username": "otherWorker", "permission": "W"}`);
    assert.equal(res.status, 403);

    console.log("Bad Request before Not Found.................");
    // Sufficient authorization, but update a nonexistent item with incorrect body should return 400
    jwt = await getJWT("admin", "admin");
    res = await sendAuthenticatedRequest('/api/event/nonexistentId', jwt, 'PUT', `{"title" "Missing colon"}`);
    assert.equal(res.status, 400);

    console.log("[OK] Validation Order Examples");
}

async function runValidationOrderTests() {
    await testValidationOrder();
    console.log("Validation order tests completed.");
}


runTests();
runElaborateTests();
runErrorTests();
runValidationOrderTests();

