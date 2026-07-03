import { Inngest, step } from "inngest";
import { prisma } from "../config/prisma.js";
import sendEmail from "../config/nodemailer.js";
import { timeStamp } from "node:console";

const LOW_STOCK_THRESHOLD = 10;

// Create a client to send and receive events
export const inngest = new Inngest({ id: "instantcart" });

//Low stock alert to admin
const checkLowStock = inngest.createFunction(
    { 
        id: "check-low-stock",
        name: "Check Low Stock", 
        triggers: [{ event: "inventory/stock.updated" }] },
        async ({ event, step }) => {
        const { productId } = event.data;
        const product = await step.run("fetch-product", async () => { return await prisma.product.findUnique({ where: { id: productId } }) });
        if(!product || product.stock === null || product.stock >= LOW_STOCK_THRESHOLD) {
            return {skipped: true,stock: product?.stock }
        }
        await step.run("send-low-stock-email",async()=>{
            const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map((e)=>e.trim()) : [];
            if(adminEmails.length === 0) return{skipped: true , reason: "No admin emails"}
            await sendEmail({
                to: adminEmails.join(","),
                subject: `Low stock alert : ${product.name}`,
                body: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 24px 28px;">
                            <h2 style="color: #fff; margin: 0; font-size: 20px;">Low Stock Alert</h2>
                        </div>
                        <div style="padding: 28px;">
                            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                                ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 64px; height: 64px; border-radius: 12px; object-fit: cover;" />` : ""}
                                <div>
                                    <h3 style="margin: 0 0 4px; font-size: 18px; color: #111827;">${product.name}</h3>
                                    <p style="margin: 0; font-size: 14px; color: #6b7280;">${product.category} • ${product.unit}</p>
                                </div>
                            </div>
                            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; text-align: center;">
                                <p style="margin: 0 0 4px; font-size: 13px; color: #991b1b; font-weight: 600;">CURRENT STOCK</p>
                                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #dc2626;">${product.stock}</p>
                                <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">units remaining</p>
                            </div>
                            <p style="margin: 20px 0 0; font-size: 13px; color: #9ca3af; text-align: center;">Please restock this item as soon as possible.</p>
                        </div>
                    </div>`
            })
        })
        return {alerted:true , product: product.name , stock: product.stock}
    },    
);

const autoAssignRider = inngest.createFunction({
    id: 'auto-assign-rider',
    name: "Auto Assign delivery riders",
    triggers: [{event: "order/placed"}]
},async({event,step})=>{
    const {orderId} = event.data;
    await step.sleep('wait-5-min',"5m");
        const result = await step.run("assign-rider",async()=>{
            const order = await prisma.order.findUnique({where:{id:orderId}})

            if(!order)   return{skipped:true,reason:"Order not found"};
            if(order.deliveryPartnerId) return{skipped:true,reason:"Delivery Partner Already assigned"}
            if(["Cancelled","Delivered"].includes(order.status as string))  return {skipped:true,reason:`Order is ${order.status}`}

            const busyOrders = await prisma.order.findMany({
                where:{
                    status: {in:["Assigned","Packed","Out for Delivery"]},
                    deliveryPartnerId: {not: null}
                },
                select: {deliveryPartnerId: true}
            })

            const busyRiderId = busyOrders.map((o)=>o.deliveryPartnerId)

            const availableRider = await prisma.deliveryPartner.findFirst({
                where:{
                    isActive:true,
                    id: {notIn: busyRiderId as string[]}
                }
            })

            if(!availableRider) return{skipped:true,reason:"No rider available"}

            const otp = Math.floor(100000 + Math.random() * 900000).toString()

            const history = (Array.isArray(order.statusHistory) ? order.statusHistory : []) as any[];
            history.push({
                status:"Assigned",
                note:`Auto-assigned to ${availableRider.name}`,
                timeStamp:new Date()
            })

            await prisma.order.update({
                where:{id: orderId},
                data:{
                    deliveryPartnerId: availableRider.id,
                    deliveryOtp: otp,
                    status: "Assigned",
                    statusHistory: history
                }
            })
            return{
                assigned: true,
                riderId: availableRider.id,
                riderName: availableRider.name,
                orderId: orderId
            }
        })

})


export const functions = [checkLowStock,autoAssignRider];