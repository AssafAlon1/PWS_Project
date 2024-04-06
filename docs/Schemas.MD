Events Schema: {
    _id : Types.ObjectId
    title : string
    category : string
    description : string
    organizer : string
    start_date : Date
    end_date : Date
    location : string
    comment_count : number
    cheapest_ticket_name : string
    cheapest_ticket_price : number
    total_available_tickets : number
    image : string
}

Ticket Schema: {
    _id : Types.ObjectId
    eventId : string
    available : number
    total : number
    price : number
    locked : [{
        username : string
        quantity : number
        expires : Date
    }]
}

Comments Schema: {
    _id : Types.ObjectId
    eventId : string
    author : string
    content : string
    createdAt : Date
}

Authentication Schema: {
    _id : Types.ObjectId
    username : string
    password : string
    role : number
}

User Actions Schema: {
    _id : Types.ObjectId
    username : string
    event_id : string
    ticket_name : string
    ticket_amount : number
    price : number
    purchase_id : string
    purchase_time : Date
    refund_time : Date
}