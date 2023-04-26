import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { userTypes } from 'src/shared/schema/user';
import  config  from 'config';
import { UserRepository } from 'src/shared/repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UserRepository) private readonly userDB: UserRepository; 
    ){}

  async create(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = await generateHashPassword(
        createUserDto.password);
        if(createUserDto.type === userTypes.ADMIN && createUserDto.secretToken !== config.get('adminSecrectToken')){
          throw new Error('Invalid secrect Token')
        }else{
          createUserDto.isVerified=true;
        }
      const user = await this.userDB.findOne({
        email:createUserDto.email
      })
      if(user){
        throw new Error('User already exist')
      }
      const otp = Math.floor(Math.random()* 900000)+100000;
      const otpExpiryTyme= new Date()
      otpExpiryTyme.setMinutes(otpExpiryTyme.getMinutes()+10)
      const newUser= await this.userDB.create({
        ...createUserDto,
        otp,
        otpExpiryTyme,
      });
      if(newUser.type !== userTypes.ADMIN){
        sendEmail(newUser.email,otp)
      }
      return{
        success:true,
        message:'User Create Successfully',
        result: {email:newUser.email}
      }
    } catch (error) {
      throw error
    }
  }

  login(email:string, password:string){
    return 'This action login a user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
