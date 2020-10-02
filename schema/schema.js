//thre Responsibilities of sema:
//1 - define object types
//2 - Define relationships b/w objet types
//3 - define root queries(entry points to the graph to interact with it)

const graphql = require("graphql");
const _ = require("lodash");
const Book = require("../models/book");
const Author = require("../models/author");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

// dummy data   ------>>>> 👉 used before adding code that interacts with MongoDB
// var books = [
//   { name: "Name of the Wind", genre: "Fantasy", id: "1", authorId: "1" },
//   { name: "The Final Empire", genre: "Fantasy", id: "2", authorId: "2" },
//   { name: "The Hero of Ages", genre: "Fantasy", id: "4", authorId: "2" },
//   { name: "The Long Earth", genre: "Sci-Fi", id: "3", authorId: "3" },
//   { name: "The Colour of Magic", genre: "Fantasy", id: "5", authorId: "3" },
//   { name: "The Light Fantastic", genre: "Fantasy", id: "6", authorId: "3" },
// ];

// var authors = [
//   { name: "Patrick Rothfuss", age: 44, id: "1" },
//   { name: "Brandon Sanderson", age: 42, id: "2" },
//   { name: "Terry Pratchett", age: 66, id: "3" },
// ];

//objectType
const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    //fields need to be wrap inside functions otherwise one type might not know about other type
    id: { type: GraphQLID }, //graphqlstring is the way in which graphql define string type
    name: { type: GraphQLString }, //these all fields are in object(returned by function)
    genre: { type: GraphQLString }, //because it helps in creating reference b/w different objecTypes
    authorId: { type: GraphQLID },
    author: {
      //return nested/related author
      type: AuthorType,
      resolve(parent, args) {
        console.log(parent);
        // return _.find(authors, { id: parent.authorId });

        //from MongoDB
        return Author.findById(parent.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      //return nested/related books
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        // return _.filter(books, { authorId: parent.id });

        //from MongoDB
        return Book.find({ authorId: parent.id });
      },
    },
  }),
});

//Root Query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    //here all the fields gonna be the separate root query, i.e, entry points into the graph
    book: {
      //return one book
      type: BookType,
      args: { id: { type: GraphQLID } }, //the argument that is passed with 'book' rot query
      resolve(parent, args) {
        // code to get data from db / other source
        // return _.find(books, { id: args.id }); //finding book from local array using lodash

        //from MongoDB
        return Book.findById(args.id);
      },
    },
    author: {
      //return one author
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // return _.find(authors, { id: args.id });

        //from MongoDB
        return Author.findById(args.id);
      },
    },
    books: {
      //return all books
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        // return books;

        //from MongoDB
        return Book.find({});
      },
    },
    authors: {
      //return all authors
      type: new GraphQLList(AuthorType),
      resolve(parent, args) {
        // return authors;

        //from MongoDB
        return Author.find({});
      },
    },
  },
});

//Mutations
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addAuthor: {
      type: AuthorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(parent, args) {
        let author = new Author({
          name: args.name,
          age: args.age,
        });
        return author.save();
      },
    },
    addBook: {
      type: BookType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        let book = new Book({
          name: args.name,
          genre: args.genre,
          authorId: args.authorId,
        });
        return book.save();
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
