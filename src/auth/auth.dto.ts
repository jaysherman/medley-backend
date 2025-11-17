export class LoginDto {
  username: string;
  password: string;
}

export class LoginResponseDto {
  token: string;
}

export class ErrorResponseDto {
  error: string;
}
