const express = require('express')
const app = express()
const PORT = 8222

app.listen(PORT, () => {
    console.log(`the server is up and running on http://localhost:${PORT}`)
})


app.get('/tshirt', (req, res) => {
    res.status(200).send({
        tshirt: 'shirt logo',
        size: 'large'
    })
})

app.post('/tshirt/:id', (req, res) => {
    const { id } = req.params
    const { logo, size } = req.body;

    if (!logo || !size) {
        return res.status(400).send({ message: 'Logo and size are required' });
    }

    res.status(201).send({
        message: 'T-shirt created successfully',
        tshirt: {
            logo,
            size
        }
    });
});

app.put('/tshirt/:id', (req, res) => {
    const { id } = req.params;
    const { logo, size } = req.body;

    if (!logo || !size) {
        return res.status(400).send({ message: 'Logo and size are required for update' });
    }

    res.send({
        message: `T-shirt with ID ${id} has been updated`,
        tshirt: {
            id,
            logo,
            size
        }
    });
});

app.delete('/tshirt/:id', (req, res) => {
    const { id } = req.params;

    res.send({
        message: `T-shirt with ID ${id} has been deleted`
    });
});