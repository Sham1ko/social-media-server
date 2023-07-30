import { PublicUser } from 'src/user/dto/IUser';

export interface IAuth {
  user: PublicUser;
  tokens: ITokens;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}
