import User from '../models/user.models.js';
import Doctor from '../models/doctor.models.js';
import Product from '../models/product.models.js';
import Order from '../models/order.models.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import NodeGeocoder from 'node-geocoder';
import { CloudinaryUpload, CloudinaryDelete } from '../utils/cloudinary.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geocoder = NodeGeocoder({
    provider: 'google',
    apiKey: process.env.GEOCODER_API_KEY, // Your API key
    formatter: null,
});

const generateAccessAndRefreshToken = async (id) => {
    const user = await User.findById(id);

    if (!user)
        res.status(403).json(
            new ApiError(403, 'user not found to generate Access Token')
        );

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    return { accessToken, refreshToken };
};

const registerUser = async (req, res) => {
    const { name, username, phoneNumber, email, password, role } = req.body;
    const profileImage = req.file.path;
    const { street, city, state, pincode } = req.body;

    if (!name)
        return res.status(400).json(new ApiError(400, 'Name is required'));
    if (!username)
        return res.status(400).json(new ApiError(400, 'Username is required'));
    if (!phoneNumber)
        return res
            .status(400)
            .json(new ApiError(400, 'Phone number is required'));
    if (!email)
        return res.status(400).json(new ApiError(400, 'Email is required'));
    if (!password)
        return res.status(400).json(new ApiError(400, 'Password is required'));
    if (!role)
        return res.status(400).json(new ApiError(400, 'Role is required'));
    if (!street)
        return res.status(400).json(new ApiError(400, 'Street is required'));
    if (!city)
        return res.status(400).json(new ApiError(400, 'City is required'));
    if (!state)
        return res.status(400).json(new ApiError(400, 'State is required'));
    if (!pincode)
        return res.status(400).json(new ApiError(400, 'pincode is required'));

    //save the longitude and latitude of the user
    let coordinate = {};
    try {
        const geolocation = await Geocoder.geocode({
            address: `${street} ${city} ${state} ${pincode}`,
            country: 'India',
        });
        if (!geolocation[0]) {
            throw new Error('No geolocation data found');
        }
        const latitude = geolocation[0].latitude;
        const longitude = geolocation[0].longitude;
        coordinate = { type: 'Point', coordinates: [longitude, latitude] };
    } catch (error) {
        return res
            .status(400)
            .json(new ApiError(400, 'Invalid address or unable to geocode'));
    }
    //update the image to cloudinary url

    let profileImageUrl;
    if (!profileImage) {
        try {
            profileImageUrl = await CloudinaryUpload(profileImage);
        } catch (error) {
            return res
                .status(500)
                .json(
                    new ApiError(
                        500,
                        'something went wrong in image uploading',
                        [error.message]
                    )
                );
        }
    }
    //creating the user
    try {
        const createdUser = await User.create({
            name,
            username,
            phoneNumber,
            email,
            password,
            profileImageUrl,
            pincode,
            coordinate,
            role,
            doctorProfile: null,
            isActive: true,
        });

        if (!createdUser)
            return res.status(400).json(new ApiError(400, 'User not created'));

        return res
            .status(201)
            .json(
                new ApiResponse(201, 'User created successfully', createdUser)
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, 'something went wrond', [error.message]));
    }
};
const loginUser = async (req, res) => {
    const { email, phoneNumber, password } = req.body;
    if (!email || !phoneNumber)
        return res
            .status(400)
            .json(new ApiError(400, 'Email or Phone number is required'));

    try {
        const user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (!user)
            return res.status(404).json(new ApiError(404, 'User not found'));

        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect)
            return res.status(400).json(new ApiError(400, 'Invalid password'));

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);

        if (!accessToken || !refreshToken)
            return res
                .status(500)
                .json(new ApiError(500, 'Something went wrong'));

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { refreshToken },
            { new: true }
        );
        if (!updatedUser)
            return res
                .status(500)
                .json(
                    new ApiError(
                        500,
                        'could not update user. Please try again later'
                    )
                );

        return res.status(200).json(
            new ApiResponse(200, 'Login successful', {
                accessToken,
                updatedUser,
            })
        );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, 'Something went wrong', [error.message]));
    }
};

const registerDoctor = async (req, res) => {
    const { name, username, phoneNumber, email, password, role } = req.body;
    const { experience, qualification, perHourCharge, license } = req.body;
    const licenseImage = req.file.license[0].path;
    const profileImage = req.file.profile[0].path;

    const { street, city, state, pincode } = req.body;

    if (!name)
        return res.status(400).json(new ApiError(400, 'Name is required'));
    if (!username)
        return res.status(400).json(new ApiError(400, 'Username is required'));
    if (!phoneNumber)
        return res
            .status(400)
            .json(new ApiError(400, 'Phone number is required'));
    if (!email)
        return res.status(400).json(new ApiError(400, 'Email is required'));
    if (!password)
        return res.status(400).json(new ApiError(400, 'Password is required'));
    if (!role)
        return res.status(400).json(new ApiError(400, 'Role is required'));
    if (!street)
        return res.status(400).json(new ApiError(400, 'Street is required'));
    if (!city)
        return res.status(400).json(new ApiError(400, 'City is required'));
    if (!state)
        return res.status(400).json(new ApiError(400, 'State is required'));
    if (!pincode)
        return res.status(400).json(new ApiError(400, 'pincode is required'));
    if (!experience)
        return res
            .status(400)
            .json(new ApiError(400, 'Experience is required'));
    if (!qualification)
        return res
            .status(400)
            .json(new ApiError(400, 'Qualification is required'));
    if (!perHourCharge)
        return res
            .status(400)
            .json(new ApiError(400, 'Per hour charge is required'));
    if (!license)
        return res.status(400).json(new ApiError(400, 'License is required'));
    if (!licenseImageUrl)
        return res
            .status(400)
            .json(new ApiError(400, 'License image is required'));

    //save the longitude and latitude of the user
    let coordinate = {};
    try {
        // Format the address string
        const fullAddress = `${street}, ${city}, ${state}, ${pincode}, India`;

        // Get geocoding results
        const results = await geocoder.geocode(fullAddress);

        // Check if we got valid results
        if (!results || results.length === 0) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'Could not find coordinates for the provided address'
                    )
                );
        }

        // Extract coordinates
        const { latitude, longitude } = results[0];

        // Format for GeoJSON Point type
        coordinate = {
            type: 'Point',
            coordinates: [longitude, latitude],
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        return res
            .status(400)
            .json(
                new ApiError(400, 'Error while geocoding address', [
                    error.message,
                ])
            );
    }
    //images uploading
    let profileImageUrl;
    if (!profileImage) {
        try {
            profileImageUrl = await CloudinaryUpload(profileImage);
        } catch (error) {
            return res
                .status(500)
                .json(
                    new ApiError(
                        500,
                        'something went wrong in image uploading',
                        [error.message]
                    )
                );
        }
    }

    //creating the license image
    let licenseImageUrl;
    try {
        licenseImageUrl = await CloudinaryUpload(licenseImage);
    } catch (error) {
        return res
            .status(500)
            .json(
                new ApiError(500, 'something went wrong in image uploading', [
                    error.message,
                ])
            );
    }

    let createdDoctor;
    try {
        createdDoctor = await Doctor.create({
            description,
            experience,
            qualification,
            isVerified: false,
            perHourCharge,
            license,
            licenseImageUrl,
            weeklySchedule: [],
        });

        if (!createdDoctor)
            return res
                .status(500)
                .send(new ApiError(500, 'Doctor not created'));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, 'something went wrond', [error.message]));
    }
    //creating the user
    try {
        const createdUser = await User.create({
            name,
            username,
            phoneNumber,
            email,
            password,
            profileImageUrl,
            pincode,
            coordinate,
            role,
            orders: [],
            animalsAvailable: [],
            doctorProfile: createdDoctor._id,
            isActive: true,
        });

        if (!createdUser)
            return res.status(400).json(new ApiError(400, 'User not created'));

        return res
            .status(201)
            .json(
                new ApiResponse(201, 'User created successfully', createdUser)
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, 'something went wrond', [error.message]));
    }
};

const changeimage = async (req, res) => {
    const user = req.user._id;
    try {
        //check if user exists ,
        //upload the new image to cloudinary
        //destroy the previous image from cloudinary
        //update the user with new image

        const dbUser = await User.findById(user);
        if (!dbUser)
            return res
                .status(404)
                .json(new ApiError(404, 'User not found please register'));

        const profileImage = req.file.path;
        if (!profileImage)
            return res.status(400).json(new ApiError(400, 'Image is required'));
        let profileImageUrl;
        try {
            profileImageUrl = await CloudinaryUpload(profileImage);
        } catch (error) {
            return res
                .status(500)
                .json(
                    new ApiError(
                        500,
                        'something went wrong in image uploading',
                        [error.message]
                    )
                );
        }

        const previousImage = dbUser.profileImageUrl;
        const publicId = previousImage.split('/').pop().split('.')[0];
        const deleteResponse = await CloudinaryDelete(publicId);

        if (!deleteResponse)
            return res
                .status(500)
                .json(
                    new ApiError(
                        500,
                        'something went wrong in deleting previous image'
                    )
                );

        const updatedUser = await User.findByIdAndUpdate(
            user,
            {
                profileImageUrl,
            },
            { new: true }
        ).select('-password -refreshToken');

        if (!updatedUser)
            return res
                .status(500)
                .json(
                    new ApiError(500, 'something went wrong in updating user')
                );

        return res
            .status(200)
            .json(
                new ApiResponse(200, 'Image changed successfully', updatedUser)
            );
    } catch (error) {
        return res
            .status(500)
            .json(
                new ApiError(500, 'something went wrong in changing image', [
                    error.message,
                ])
            );
    }
};

const userLogout = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { refreshToken: null },
            { new: true }
        );
        if (!user) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }

        return res.status(200).json(new ApiResponse(200, 'Logout successful'));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Something went wrong', [error.message]));
    }
};

//Ai validation for user license photo on the basis of qualifications etc and then
//then set isVerified to trueconst genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const updateDoctorDetails = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const {
            description,
            experience,
            qualification,
            perHourCharge,
            license,
            licenseImageUrl,
        } = req.body;

        if (!doctorId || !licenseImageUrl) {
            return res.status(400).json({
                message: 'Doctor ID and license image URL are required',
            });
        }

        // Find existing doctor
        const userdoctor = await User.findById(doctorId).doctorProfile;
        if (!userdoctor)
            return res
                .status(404)
                .json(new ApiError(404, 'user is not a doctor'));
        const doctor = await Doctor.findById(userdoctor);
        if (!doctor) {
            return res.status(404).json(new ApiError(404, 'Doctor not found'));
        }

        // Initialize Gemini Vision model (free tier)
        const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

        // Create a simpler prompt for the free tier
        const prompt = `Analyze this medical license image and answer the following questions:
            1. Can you see a medical license number? If yes, what is it?
            2. What qualifications or degrees are listed on the document?
            3. Does this appear to be an official medical license document?
            
            Compare with these provided details:
            - License number should be: ${license}
            - Expected qualifications: ${qualification.join(', ')}
            
            Format your response exactly like this example:
            {
                "licenseNumberFound": "ABC123",
                "qualificationsFound": ["MBBS", "MD"],
                "isOfficialDocument": true,
                "matchesProvided": true,
                "confidence": 0.9
            }`;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: licenseImageUrl,
                    mimeType: 'image/jpeg',
                },
            },
            prompt,
        ]);

        const aiAnalysis = JSON.parse(result.response.text());

        // Simplified verification logic for free tier
        const shouldVerify =
            aiAnalysis.isOfficialDocument &&
            aiAnalysis.matchesProvided &&
            aiAnalysis.confidence > 0.8;

        // Update doctor details
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            doctorId,
            {
                description: description || doctor.description,
                experience: experience || doctor.experience,
                qualification: qualification || doctor.qualification,
                perHourCharge: perHourCharge || doctor.perHourCharge,
                license: license || doctor.license,
                licenseImageUrl: licenseImageUrl,
                isVerified: shouldVerify,
            },
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, 'Doctor details updated successfully', {
                message: 'Doctor details updated successfully',
                doctor: {
                    ...updatedDoctor.toObject(),
                    verificationDetails: {
                        isVerified: shouldVerify,
                        aiAnalysis: {
                            licenseMatch:
                                aiAnalysis.licenseNumberFound === license,
                            qualificationsFound: aiAnalysis.qualificationsFound,
                            confidence: aiAnalysis.confidence,
                        },
                    },
                },
            })
        );
    } catch (error) {
        console.error('Error updating doctor details:', error);
        return res.status(500).json({
            message: 'Error updating doctor details',
            error: error.message,
        });
    }
};

const getWishlist = async (req, res) => {
    const user = req.user._id;
    try {
        const dbUser = await User.findById(user);
        if (!dbUser)
            return res.status(404).json(new ApiError(404, 'User not found'));

        const wishlist = dbUser.wishlist;
        if (wishlist.length === 0)
            return res
                .status(200)
                .json(new ApiResponse(200, 'No items in wishlist', {}));

        return res
            .status(200)
            .json(new ApiResponse(200, 'Wishlist items', wishlist));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Something went wrong', [error.message]));
    }
};

const addToWishlist = async (req, res) => {
    const user = req.user._id;
    try {
        const dbUser = await User.findById(user);
        if (!dbUser)
            return res.status(404).json(new ApiError(404, 'User not found'));

        const wishlist = dbUser.wishlist;
        const { productId } = req.body;
        if (!productId)
            return res
                .status(400)
                .json(new ApiError(400, 'Product id is required'));

        const dbProduct = await Product.findById(productId);
        if (!dbProduct)
            return res.status(404).json(new ApiError(404, 'Product not found'));

        if (dbProduct.stockAvailability === 0)
            return res
                .status(400)
                .json(new ApiError(400, 'Product out of stock'));

        const isAlreadyInWishlist = wishlist.includes(productId);
        if (isAlreadyInWishlist)
            return res
                .status(400)
                .json(new ApiError(400, 'Product already in wishlist'));

        wishlist.push(productId);
        const updatedUser = await User.findByIdAndUpdate(
            user,
            { wishlist },
            { new: true }
        ).select('-password -refreshToken');
        if (!updatedUser)
            return res
                .status(500)
                .json(
                    new ApiError(500, 'something went wrong in updating user')
                );

        return res
            .status(200)
            .json(
                new ApiResponse(200, 'Product added to wishlist', updatedUser)
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Something went wrong', [error.message]));
    }
};

const removeWishlist = async (req, res) => {
    const user = req.user._id;
    try {
        const dbUser = await User.findById(user);
        if (!dbUser)
            return res.status(404).json(new ApiError(404, 'User not found'));

        const wishlist = dbUser.wishlist;
        const { productId } = req.body;
        if (!productId)
            return res
                .status(400)
                .json(new ApiError(400, 'Product id is required'));

        const isInWishlist = wishlist.includes(productId);
        if (!isInWishlist)
            return res
                .status(400)
                .json(new ApiError(400, 'Product not in wishlist'));

        const updatedWishlist = wishlist.filter(
            (item) => item.toString() !== productId
        );

        const updatedUser = await User.findByIdAndUpdate(
            user,
            { wishlist: updatedWishlist },
            { new: true }
        ).select('-password -refreshToken');
        if (!updatedUser)
            return res
                .status(500)
                .json(
                    new ApiError(500, 'something went wrong in updating user')
                );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    'Product removed from wishlist',
                    updatedUser
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Something went wrong', [error.message]));
    }
};

const getUserCart = async (req, res) => {
    const user = req.user._id;
    try {
        const dbUser = await User.findById(user);
        if (!dbUser)
            return res.status(404).json(new ApiError(404, 'User not found'));

        const cart = dbUser.cart;
        if (cart.length === 0)
            return res
                .status(200)
                .json(new ApiResponse(200, 'No items in cart', {}));

        return res.status(200).json(new ApiResponse(200, 'Cart items', cart));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Something went wrong', [error.message]));
    }
};

const addToUserCart = async (req, res) => {
    const user = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
        return res
            .status(400)
            .json(new ApiError(400, 'Product ID and quantity are required'));
    }

    try {
        const dbUser = await User.findById(user);
        if (!dbUser) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }

        const dbProduct = await Product.findById(productId);
        if (!dbProduct) {
            return res.status(404).json(new ApiError(404, 'Product not found'));
        }

        if (dbProduct.stockAvailability < quantity) {
            return res
                .status(400)
                .json(new ApiError(400, 'Insufficient stock'));
        }

        const cartItem = dbUser.cart.find(
            (item) => item.product.toString() === productId
        );
        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            dbUser.cart.push({ product: productId, quantity });
        }

        const updatedUser = await dbUser.save();
        return res
            .status(200)
            .json(
                new ApiResponse(200, 'Product added to cart', updatedUser.cart)
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, 'Something went wrong', [error.message]));
    }
};

const removeFromUserCart = async (req, res) => {
    const user = req.user._id;
    const { productId } = req.body;

    if (!productId) {
        return res
            .status(400)
            .json(new ApiError(400, 'Product ID is required'));
    }

    try {
        const dbUser = await User.findById(user);
        if (!dbUser) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }

        const cartItemIndex = dbUser.cart.findIndex(
            (item) => item.product.toString() === productId
        );
        if (cartItemIndex === -1) {
            return res
                .status(400)
                .json(new ApiError(400, 'Product not in cart'));
        }

        dbUser.cart.splice(cartItemIndex, 1);

        const updatedUser = await dbUser.save();
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    'Product removed from cart',
                    updatedUser.cart
                )
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, 'Something went wrong', [error.message]));
    }
};

const getPreviousOrders = async (req, res) => {
    const userId = req.user._id; // Get the authenticated user's ID

    try {
        const user = await Order.find({ buyerId: userId }).populate({
            path: 'orders',
            populate: {
                path: 'productId',
                model: 'Product',
                select: 'name price description imageUrl category brandName',
            },
        });

        if (!user) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    'Previous orders retrieved successfully',
                    user.orders
                )
            );
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json(
                new ApiError(
                    500,
                    'Something went wrong with getting previous orders',
                    [error.message]
                )
            );
    }
};

const listAnimals = async (req, res) => {
    const user = req.user._id;
    const { name, price, description, brandName, stockAvailability } = req.body;
    if (!user) return res.status(400).json(new ApiError(400, 'User not found'));
    if (!name) {
        return res.status(400).json(new ApiError(400, 'Name is required'));
    }
    if (!price) {
        return res.status(400).json(new ApiError(400, 'Price is required'));
    }
    if (!description) {
        return res
            .status(400)
            .json(new ApiError(400, 'Description is required'));
    }
    if (!brandName) {
        return res
            .status(400)
            .json(new ApiError(400, 'Brand name is required'));
    }
    if (!stockAvailability) {
        return res
            .status(400)
            .json(new ApiError(400, 'Stock availability is required'));
    }

    //upload on cloudinary
    let imageUrl;
    try {
        imageUrl = await CloudinaryUpload(req.file.path);
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Something went wrong', [error.message]));
    }

    try {
        const dbUser = await User.findById(user);
        if (!dbUser)
            return res.status(404).json(new ApiError(404, 'User not found'));

        const createdAnimal = await Product.create({
            name,
            price,
            description,
            imageUrl,
            brandName,
            stockAvailability,
            sellerId: user,
            category: 'animal',
        });

        if (!createdAnimal)
            return res
                .status(400)
                .json(new ApiError(400, 'Animal not created'));

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    'Animal created successfully',
                    createdAnimal
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'Something went wrong with listing', [
                    error.message,
                ])
            );
    }
};

const showlistedAnimals = async (req, res) => {
    const user = req.user._id;

    try {
        const dbUser = await User.findById(user);
        if (!dbUser)
            return res.status(404).json(new ApiError(404, 'User not found'));

        const listedAnimals = Product.find({
            sellerId: user,
            category: 'animal',
        });

        if (listedAnimals.length === 0)
            return res
                .status(200)
                .json(new ApiResponse(200, 'No animals listed', {}));

        return res
            .status(200)
            .json(new ApiResponse(200, 'Listed animals', listedAnimals));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Something went wrong', [error.message]));
    }
};

const removelistedAnimals = async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        return res
            .status(400)
            .json(new ApiError(400, 'Product ID is required'));
    }

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json(new ApiError(404, 'Product not found'));
        }

        if (product.sellerId.toString() !== user.toString()) {
            return res
                .status(403)
                .json(new ApiError(403, 'Unauthorized action'));
        }

        const deletedEntry = await Product.findByIdAndDelete(productId);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    'Product deleted successfully',
                    deletedEntry
                )
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, 'Something went wrong', [error.message]));
    }
};
export {
    registerUser,
    loginUser,
    updateDoctorDetails,
    listAnimals,
    registerDoctor,
    getWishlist,
    addToWishlist,
    removeWishlist,
    getUserCart,
    showlistedAnimals,
    removelistedAnimals,
    addToUserCart,
    removeFromUserCart,
    changeimage,
    userLogout,
    getPreviousOrders,
};
