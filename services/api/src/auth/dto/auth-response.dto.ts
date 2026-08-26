export class AuthResponseDto {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token?: string;
    user: {
      id: string;
      email: string;
      name: string;
      roles: string[];
    };
  };
}
