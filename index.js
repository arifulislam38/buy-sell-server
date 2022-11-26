const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());









const uri = process.env.REACT_APP_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });








async function run() {
  try {
    await client.connect();

  } catch(error) {
    console.log(error.name, error.message)
  }
}
run();




const usersCollection = client.db('swaplaptop').collection('users');
const productsCollection = client.db('swaplaptop').collection('products');
const wishCollection = client.db('swaplaptop').collection('wishlist');
const reportCollection = client.db('swaplaptop').collection('reportedProduct');






function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

};


const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
};



// .projects({item:1}) require value:1 that means it gives the inpute value;

// app.get('/jwt', async (req, res) => {
//             const email = req.query.email;
//             const query = { email: email };
//             const user = await usersCollection.findOne(query);
//             if (user) {
//                 const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
//                 return res.send({ accessToken: token });
//             }
//             res.status(403).send({ accessToken: '' })
// });



// app.post('/jwt', (req, res) =>{
//             try {
//                 const user = req.body;
//                 const token = jwt.sign(user,process.env.JWT_secret,{expiresIn:'1h'});
//                 res.send({
//                     token,
//                     success: true,
//                     message: 'successfully got the token'
//                 });
//             } catch (error) {
//                res.send({
//                  success: false,
//                  message: error.message
//                })
//             }
//         });

//create jwt for user
app.post('/jwt', (req, res) =>{
            try {
                const user = req.body;
                const token = jwt.sign(user,process.env.JWT_SECRET,{expiresIn:'12h'});
                res.send({
                    token,
                    success: true,
                    message: 'successfully got the token'
                });
            } catch (error) {
               res.send({
                 success: false,
                 message: error.message
               })
            }
        });


//  create user and give token to the client side
app.put('/createuser', async(req,res) =>{
    try {
      const user = req.body;
      console.log(user)
      const query = {user: user.email};
      const update = {
        $set:{
          name: user.name,
          type: user.type,
          image: user.image,
          role: user.role,
          verified: false
        }
      };
      const options = { upsert: true };
      const token = jwt.sign(user,process.env.JWT_SECRET,{expiresIn:'12h'});
      const result = await usersCollection.updateOne(query,update,options);

      res.send({
        token,
        data: result,
        success: true,
        message: 'successfully got the token'
    });
    } catch (error) {
      res.send({
        success: false,
        message: error.message
      })
    }
});

// check admin route api
app.get('/admin', async(req,res)=>{
  try {
    const user = req.query.email;
    const query = { user: user };
    const result = await usersCollection.findOne(query);
    res.send({
      success: true,
      data: result
    })
  } catch (error) {
    res.send({
        success: false,
        message: error.message
      })
  }
});

// category data load by product category name
app.get('/category/:id', async (req,res) =>{
  try {
    const id = req.params.id;
    const query = {category: id};
    const result = await productsCollection.find(query).toArray();
    res.send({
      success: true,
      data: result
    })
    
  } catch (error) {
    res.send({
        success: false,
        message: error.message
      })
  }
});



// add product to the wishlist
app.post('/wishlist', async(req,res)=>{
 try {
    const id = req.query.id;
    const email = req.query.email;
    const query = {_id: ObjectId(id)}
    const product = await productsCollection.findOne(query);
    product.wish = email;

    const result = await wishCollection.insertOne(product);

  res.send({
    success: true,
    data: result
  });
 } catch (error) {
  res.send({
        success: false,
        message: error.message
      })
 }
});



// add product to the reportlist
app.post('/report', async(req,res)=>{
 try {
    const id = req.query.id;
    const email = req.query.email;
    const query = {_id: ObjectId(id)}
    const product = await productsCollection.findOne(query);
    product.report = email;

    const result = await reportCollection.insertOne(product);

  res.send({
    success: true,
    data: result
  });
 } catch (error) {
  res.send({
        success: false,
        message: error.message
      })
 }
});

// all users data send to the client side
app.get('/allusers', async(req,res)=>{
  try {
    const result = await usersCollection.find({}).toArray();
    console.log(result)
    res.send({
      success: true,
      data: result
    })
  } catch (error) {
    res.send({
        success: false,
        message: error.message
    })
  }
});


// all sellers data send to the client side
app.get('/allsellers', async(req,res)=>{
  try {
    const result = await usersCollection.find({}).toArray();
    const sellers = result.filter(data=> data.type === 'Seller');
    res.send({
      success: true,
      data: sellers
    })
    
  } catch (error) {
    res.send({
        success: false,
        message: error.message
    })
  }
});


app.get('/', async (req, res) => {
    res.send('Assignment 12 server is running');
})

app.listen(port, () => console.log(`Ass 12 server is running on ${port}`));