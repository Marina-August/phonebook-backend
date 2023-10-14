const express = require('express');
const morgan = require('morgan');
const cors = require('cors')


const app = express()

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]
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
  response.json(persons)
})

const date = new Date();

app.get('/info', (request, response) => {
  response.send(`<div>
                    <p>Phonebook has info for ${persons.length} people</p>
                    <p> ${date}</p> 
                 </div>`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(note => note.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }

})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = ()=>{
  let id = 0;
  do{
    id = Math.random();
  } while (persons.some(person => person.id === id))
  return id;
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log(body.name)
  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name/number missing' 
    })
  }

  if(persons.some(person => person.name === body.name)){
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const newPerson = {
    id: generateId(),
    name: body.name, 
    number: body.number,
  }

  let persons_ = [...persons];
      persons = [...persons_, newPerson ]

  response.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})