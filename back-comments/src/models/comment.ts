import * as mongoose from "mongoose";

// Everything in Mongoose starts with a Schema.
// Each schema maps to a MongoDB collection and defines the shape of the documents within that collection.

// Creating new Schema object
// Each propery have type filed - https://mongoosejs.com/docs/schematypes.html
// And requierd files if needed
const commentSchema = new mongoose.Schema(
  /* Filled in your comment schema */
  {
    eventId: { type: String, required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { 
      type: String, 
      required: true,
      validate: {
        validator: function(value) {
          return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
        },
        message: props => `${props.value} is not a valid date format (YYYY-MM-DDTHH:MM).`
      }
    }
  }
  /* ========== */
);

// Models are fancy constructors compiled from Schema definitions. An instance of a model is called a document.
// Models are responsible for creating and reading documents from the underlying MongoDB database.
// https://mongoosejs.com/docs/models.html
export default mongoose.model("Comment", commentSchema);
