import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { userTypes } from 'src/shared/schema/user';
import config from 'config';
import { UserRepository } from 'src/shared/repositories/user.repository';
import {
  comparePassword,
  generateHashPassword,
} from 'src/shared/utility/password-manager';
import { sendEmail } from 'src/shared/utility/mail-handler';
import { generateAuthToken } from 'src/shared/utility/token-generator';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UserRepository) private readonly userDB: UserRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // generate the hash password
      createUserDto.password = await generateHashPassword(
        createUserDto.password,
      );

      /// check is it for admin
      if (
        createUserDto.type === userTypes.ADMIN &&
        createUserDto.secretToken !== config.get('adminSecretToken')
      ) {
        throw new Error('Not allowed to create admin');
      } else if (createUserDto.type !== userTypes.CUSTOMER) {
        createUserDto.isVerified = true;
      }

      // user is already exist
      const user = await this.userDB.findOne({
        email: createUserDto.email,
      });
      if (user) {
        throw new Error('User already exist');
      }

      // generate the otp
      const otp = Math.floor(Math.random() * 900000) + 100000;

      const otpExpiryTime = new Date();
      otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 10);

      const newUser = await this.userDB.create({
        ...createUserDto,
        otp,
        otpExpiryTime,
      });

      if (newUser.type !== userTypes.ADMIN) {
        await sendEmail(
          newUser.email,
          config.get('emailTemplates.create-user'),
          'Email verification',
          {
            customerName: newUser.name,
            customerEmail: newUser.email,
            otp,
          },
        );
      }

      return {
        success: true,
        message:
          newUser.type === userTypes.ADMIN
            ? 'Admin created successfully'
            : 'Please activate your account by verifying your email. We have sent you a wmail with the otp',
        result: { email: newUser.email },
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const userExists = await this.userDB.findOne({
        email,
      });
      if (!userExists) {
        throw new Error('Invalid email or password');
      }
      if (!userExists.isVerified) {
        throw new Error('Please verify your email');
      }
      const isPasswordMatch = await comparePassword(
        password,
        userExists.password,
      );
      if (!isPasswordMatch) {
        throw new Error('Invalid email or password');
      }
      const token = await generateAuthToken(userExists._id);

      return {
        success: true,
        message: 'Login successful',
        result: {
          user: {
            name: userExists.name,
            email: userExists.email,
            type: userExists.type,
            id: userExists._id.toString(),
          },
          token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(otp: string, email: string) {
    try {
      const user = await this.userDB.findOne({
        email,
      });
      if (!user) {
        throw new Error('User not found');
      }
      if (user.otp !== otp) {
        throw new Error('Invalid otp');
      }
      if (user.otpExpiryTime < new Date()) {
        throw new Error('Otp expired');
      }
      await this.userDB.updateOne(
        {
          email,
        },
        {
          isVerified: true,
        },
      );

      return {
        success: true,
        message: 'Email verified successfully. you can login now',
      };
    } catch (error) {
      throw error;
    }
  }

  async sendOtpEmail(email: string) {
    try {
      console.log('email');
      console.log(email);
      const user = await this.userDB.findOne({ email: email });
      
      
      if (!user) {
        throw new Error('User not found');
      }
      if (user.isVerified) {
        throw new Error('Email already verified');
      }
      const otp = Math.floor(Math.random() * 900000) + 100000;

      const otpExpiryTime = new Date();
      otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 10);

      await this.userDB.updateOne(
        {
          email,
        },
        {
          otp,
          otpExpiryTime,
        },
      );
      await sendEmail(user.email,config.get('emailTemplates.otp-user'), 'Email verification', {
        customerName: user.name,
        customerEmail: user.email,
        otp,
      });
      return {
        success: true,
        message: 'Otp sent successfully',
        result: { email: user.email },
      };
    } catch (error) {
      throw error;
    }
  }

    async forgotPassword(email: string) {
      try {
        const user = await this.userDB.findOne({
          email,
        });
        if (!user) {
          throw new Error('User not found');
        }
        let password = Math.random().toString(36).substring(2, 12);
        const tempPassword = password;
        password = await generateHashPassword(password);
        await this.userDB.updateOne(
          {
            _id: user._id,
          },
          {
            password,
          },
        );
  
        sendEmail(
          user.email,
          config.get('emailTemplates.forgotPassword'),
          'Forgot password',
          {
            customerName: user.name,
            customerEmail: user.email,
            newPassword: password,
            loginLink: config.get('loginLink'),
          },
        );
  
        return {
          success: true,
          message: 'Password sent to your email',
          result: { email: user.email},
        };
      } catch (error) {
        throw error;
      }
    
  }
  async findAll(type: string) {
    try {
      const users = await this.userDB.find({
        type,
      });
      return {
        success: true,
        message: 'Users fetched successfully',
        result: users,
      };
    } catch (error) {
      throw new Error(`Error al buscar usuarios por tipo ${type}: ${error.message}`);
    }
  }
async updatePasswordOrName(
id: string,
updatePasswordOrNameDto: UpdateUserDto,
) {
try {
const { oldPassword, newPassword, name } = updatePasswordOrNameDto;
const user = await this.userDB.findOne({
_id: id,
});
if (!user) {
throw new Error('User not found');
}
if (newPassword) {
const isPasswordMatch = await comparePassword(
oldPassword,
user.password,
);
if (!isPasswordMatch) {
throw new Error('Invalid current password');
}
const password = await generateHashPassword(newPassword);
await this.userDB.updateOne(
{
_id: id,
},
{
password,
},
);
// volver a buscar al usuario actualizado después de actualizar la contraseña
user.password = password;
}
if (name) {
await this.userDB.updateOne(
{
_id: id,
},
{
name,
},
);
// volver a buscar al usuario actualizado después de actualizar el nombre
user.name = name;
}
return {
success: true,
message: 'User updated successfully',
result: {
name: user.name,
email: user.email,
password: user.password,
type: user.type,
id: user._id.toString(),
},
};
} catch (error) {
throw error;
}
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
