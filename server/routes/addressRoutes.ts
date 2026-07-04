import express from "express";
import { addAddress, getAddresses, updateAddress } from "../controller/addressController.js";
import auth from "../middleware/auth.js";

const addressRouter = express.Router()
addressRouter.get('/', auth ,getAddresses)
addressRouter.post('/', auth ,addAddress)
addressRouter.put('/:id' , auth , updateAddress)
addressRouter.delete('/:id',auth,getAddresses)

export default addressRouter