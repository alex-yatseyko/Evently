'use server'

import { revalidatePath } from 'next/cache'

import { handleError } from "@/lib/utils"
import { CreateUserParams } from "@/types"
import { checkDatabaseConnection, connectToDatabase } from "../database"
import User from "../database/models/user.model"
import Order from '../database/models/order.model'
import Event from '../database/models/event.model'

export const createUser = async (user: CreateUserParams) => {
    try {
        await connectToDatabase();
        await checkDatabaseConnection();
        console.log('Creating user')

        const newUser = await User.create(user);

        return JSON.parse(JSON.stringify(newUser));
    } catch (error) {
        handleError(error)
    }
}

export const updateUser = async (user: CreateUserParams) => {
    try {
        await connectToDatabase();

        const updatedUser = await User.findOneAndUpdate({ clerkId: user.clerkId }, user, { new: true });

        if (!updatedUser) throw new Error('User update failed')
        return JSON.parse(JSON.stringify(updatedUser));
    } catch (error) {
        handleError(error)
    }
}

// export const deleteUser = async (clerkId: string) => {
//     try {
//         await connectToDatabase();

//         const deletedUser = await User.findOneAndDelete({ clerkId });

//         if (!deletedUser) throw new Error('User delete failed')
//         return JSON.parse(JSON.stringify(deletedUser));
//     } catch (error) {  
//         handleError(error)
//     }
// }

export async function deleteUser(clerkId: string) {
    try {
      await connectToDatabase()
  
      // Find user to delete
      const userToDelete = await User.findOne({ clerkId })
  
      if (!userToDelete) {
        throw new Error('User not found')
      }
  
      // Unlink relationships
      await Promise.all([
        // Update the 'events' collection to remove references to the user
        Event.updateMany(
          { _id: { $in: userToDelete.events } },
          { $pull: { organizer: userToDelete._id } }
        ),
  
        // Update the 'orders' collection to remove references to the user
        Order.updateMany({ _id: { $in: userToDelete.orders } }, { $unset: { buyer: 1 } }),
      ])
  
      // Delete user
      const deletedUser = await User.findByIdAndDelete(userToDelete._id)
      revalidatePath('/')
  
      return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null
    } catch (error) {
      handleError(error)
    }
  }