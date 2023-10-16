const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person')

const app = express()


const errorHandler = (error, request, response, next) => {
  console.log(request.body.name)
 
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message})
  }
  else if (error.message === `Information of ${request.body.name} has already been removed from server.`) {
    return response.status(404).json({ error: error.message})
  }
  next(error)
}

app.use(express.json());
app.use(cors());
app.use(express.static('dist'))

morgan.token('postData', (req, res) => {
  if (req.method === 'POST') {
      return JSON.stringify(req.body);
  }
  return '-';
});

const logFormat = ':method :url :status :res[content-length] - :response-time ms :postData';

app.use(morgan(logFormat));

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

const date = new Date();

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
   response.send(`<div>
                    <p>Phonebook has info for ${persons.length} people</p>
                    <p> ${date}</p> 
                 </div>`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = Number(request.params.id)

  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = ()=>{
  let id = 0;
  do{
    id = Math.random();
  } while (persons.some(person => person.id === id))
  return id;
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body.name)

  const person = new Person({
    name: body.name,
    number: body.number,
  })
  person.save()
    .then(savedPerson => {
    response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      
      console.log(body.name);
      // if object was deleted
      if (!updatedPerson) {
        next(Error (`Information of ${body.name} has already been removed from server.`))
      }
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})