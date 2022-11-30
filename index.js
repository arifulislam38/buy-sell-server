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
    const usersCollection = client.db('swaplaptop').collection('users');
const productsCollection = client.db('swaplaptop').collection('products');
const wishCollection = client.db('swaplaptop').collection('wishlist');
const reportCollection = client.db('swaplaptop').collection('reportedProduct');
const advertiseCollection = client.db('swaplaptop').collection('advertise');
const ordersCollection = client.db('swaplaptop').collection('orders');






function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

};



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
    const products = await productsCollection.find(query).toArray();
    const result = products.filter(product=> product.status !== 'sold');
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
app.post('/wishlist',verifyJWT, async(req,res)=>{
 try {
    const id = req.query.id;
    const email = req.query.email;
    const decoded = req.decoded;
            if(decoded.email !== email){
                return res.status(403).send({message: 'unauthorized access'})
            }
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
app.post('/report',verifyJWT, async(req,res)=>{
 try {
    const id = req.query.id;
    const email = req.query.email;
     const decoded = req.decoded;
            if(decoded.email !== email){
                return res.status(403).send({message: 'unauthorized access'})
            }
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


app.get('/report',verifyJWT, async(req,res)=>{
  try {
    const result = await reportCollection.find({}).toArray();
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


app.post('/deletereport',verifyJWT, async(req,res)=>{
  try {
    const id = req.query.id;
    const query = {_id: ObjectId(id)};
    const result = await reportCollection.deleteOne(query);
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

// all users data send to the client side
app.get('/allusers',verifyJWT, async(req,res)=>{
  try {
    const result = await usersCollection.find({}).toArray();
    const users = result.filter(user=> user.role !== "admin");
    res.send({
      success: true,
      data: users
    })
  } catch (error) {
    res.send({
        success: false,
        message: error.message
    })
  }
});


// all sellers data send to the client side
app.get('/allsellers',verifyJWT, async(req,res)=>{
  try {
    const result = await usersCollection.find({}).toArray();
    const sellers = result.filter(data=> data.type === 'Seller' && data.role !== 'admin');
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



app.post('/allsellers',verifyJWT, async(req,res)=>{
  try {
    const id = req.query.id;
    const query = {_id: ObjectId(id)};

    const result = await usersCollection.deleteOne(query);
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


// all buyers ger api
app.get('/allbuyers',verifyJWT, async(req,res)=>{
  try {
    const result = await usersCollection.find({}).toArray();
    const buyers = result.filter(data=> data.type === 'Buyer' && data.role !== 'admin');
    res.send({
      success: true,
      data: buyers
    })
    
  } catch (error) {
    res.send({
        success: false,
        message: error.message
    })
  }
});

// get the orders for a user 
app.get('/myorders',verifyJWT, async(req,res)=>{
  try {
    const email = req.query.email;
    const query = {buyer: email};
    const result = await ordersCollection.find(query).toArray();
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



app.post('/myorders',verifyJWT, async(req,res)=>{
  try {
    const id = req.query.id;
    const query = {_id: ObjectId(id)};

    const result = await ordersCollection.deleteOne(query);
      if(result.deletedCount === 1){
        res.send({
        success: true,
        data: result
      })
    }
    
    
  } catch (error) {
    res.send({
        success: false,
        message: error.message
    })
  }
});


// single order by product id
app.get('/orders/:id', async(req,res)=>{
  try {
    const id = req.params.id;
    const query = {_id: ObjectId(id)};

    const result = await ordersCollection.findOne(query);
      
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


// my products data loaded through this api

app.get('/myproducts',verifyJWT, async(req,res)=>{
  try {
    const id = req.query.id;
    const query = {};
    const products = await productsCollection.find(query).toArray();
    const result = products.filter(product=> product.seller.email === id);
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


// advertise data pushted to the advertise collection

app.patch('/advertise',verifyJWT, async(req,res)=>{
  try {
    const id = req.query.id;
    const query = {_id: ObjectId(id)};
    const product = await productsCollection.findOne(query);
    const {name, description, image, category,location, originalPrice, resellPrice, duration, seller, time} = product;
    const options = {upsert:true};
    const update = {
      $set:{
        name, 
        description, 
        image, category,
        location, 
        originalPrice, 
        resellPrice, 
        duration, 
        advertise: seller, 
        time
      }
    };
    const result = await advertiseCollection.updateOne(query,update,options);
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


//Delete the product by user

app.post('/advertise',verifyJWT, async(req,res)=>{
  try {
    const id = req.query.id;
    const query = {_id: ObjectId(id)};
    const result = await productsCollection.deleteOne(query);
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


// get all advertise data from here
app.get('/advertise',verifyJWT, async(req,res)=>{
  try {
    const result = await advertiseCollection.find({}).toArray();
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


// add product to the product collection by seller

app.post('/addproduct', async(req,res)=>{
  try {
      const product = req.body;
      console.log(product)
      const result = await productsCollection.insertOne(product);
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



// handle order by modal

app.post('/order',verifyJWT, async(req,res)=>{
  try {
    const id = req.query.id;
    const email = req.query.email;
    const decoded = req.decoded;
            if(decoded.email !== email){
                return res.status(403).send({message: 'unauthorized access'})
            }
    const product = req.body;
    const data = await productsCollection.findOne({_id:ObjectId(id)});
    data.buyer = email;
    const {name, description, image, category,location, originalPrice, resellPrice, duration, seller,buyer, time} = data;
    const pdata = {
      name,
      description,
      image,
      category,
      location,originalPrice,
      resellPrice,
      duration,
      seller,
      buyer,time,
      ...product
    }
    const result = await ordersCollection.insertOne(pdata)
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
/// wish collection for particular
app.get('/wishlist',verifyJWT,async(req,res)=>{
  try {
    const email = req.query.email;
    const query = {wish: email};
    const result = await wishCollection.find(query).toArray();
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





  

  } catch(error) {
    console.log(error.name, error.message)
  }
}
run();







app.get('/', async (req, res) => {
    res.send('Assignment 12 server is running');
})

app.listen(port, () => console.log(`Ass 12 server is running on ${port}`));