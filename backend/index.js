const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer"); //image storage system
const path = require("path"); // express to backend directory in our express app
const cors = require("cors");
// const { default: all_product } = require("../frontend/src/Components/Assets/all_product");
// const dotenv = require("dotenv");
// dotenv.config();

app.use(express.json()); //  what will be the response for json automatically passed through json
app.use(cors()); // exprees js code connect to 4000 port

// Password : lrcC9JTT6Z9Gggcm

mongoose.connect("mongodb+srv://ds290828:lrcC9JTT6Z9Gggcm@cluster0.f2tmszp.mongodb.net/e-commerce");
// Database connection with mongodb
// mongoose.connect(process.env.DatabaseURL , {
//     useNewUrlParser:true,
// })
// .then(() => console.log("Database connected successfully"))
// .catch((err)=> console.log("Error in connecting to mongodb",err));

// Get the default connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:')); // Event handlers for connection events
db.once('open', function () {
    console.log('Connected to MongoDB Atlas HEHEHE');
});
db.on('disconnected', function () {
    console.log('Disconnected from MongoDB Atlas');
});

// if (db.readyState === 1) {   // Check the connection status
//   console.log('Connected to MongoDB Atlas');
// } else {
//   console.log('Not connected to MongoDB Atlas');
// }

// API creation
app.get("/", (req, res) => {
    res.send("Express App is Running")
})
console.log("fuck you");
// Image storage Engine 
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ storage: storage })

// creating upload endpoint for images
app.use('/images', express.static('upload/images'))

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for creating Products
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        dafault: true,
    },
})

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success: true,
        name: req.body.name,
    })
})

// Creating API for deleting Products
app.post("/removeproduct", async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name,
    })
})

// Creating API for getting all products
app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})


//Schema creating for user models

const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

// creating endpoints for registering the user
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "Existing User Found with same Email-ID" });
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();

    const data = {  // data object creation
        user: {
            id: user.id
        }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token })
})

//creating endpoint for user login
app.post("/login", async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        }
        else {
            res.json({
                success: false, errors: "Wrong Password"
            });
        }
    }
    else {
        res.json({ success: false, errors: "Wrong Email Id" });
    }
})

// Creating the end points for new collection
app.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New Collection fetched");
    res.send(newcollection);
})


// Creating the endpoints for popular in women category
app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({ category: "women" });
    let popular_in_women = products.slice(0, 4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
})


// cReating middlewares to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "Please authenticate using valid token" });
    }
    else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: "Please authenticate using valid token" });
        }
    }
}


// cReating the endpoints for adding products in cart data
app.post('/addtocart', fetchUser, async (req, res) => {
    //    console.log(req.body,req.user);
    console.log("Added", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    // res.send("Added");
})


//Creating the end points to remove from cartData
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("removed", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1;
    }
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    // res.send("Removed");
})


// Creating the end points for getCartItem
app.post('/getcart',fetchUser,async(req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})


app.listen(port, (error) => {
    if (!error) {
        console.log("Server running on port " + port);
    }
    else {
        console.log("Error : " + error);
    }
})



