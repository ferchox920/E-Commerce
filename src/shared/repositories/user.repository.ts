import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from '../schema/user';


@Injectable()
export class UserRepository {
  constructor(@InjectModel(Users.name) private userModel: Model<Users>) {}

  async findOne(query: any){
    return this.userModel.findOne(query);
  }

  async create(data: Record<string, any>){
    return await this.userModel.create(data);
   
  }

  async updateUser(id: string, userDto: any): Promise<Users> {
    return this.userModel.findByIdAndUpdate(id, userDto, { new: true }).exec();
  }

  async deleteUser(id: string): Promise<Users> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
