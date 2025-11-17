import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  private readonly demoUsername: string;
  private readonly demoPassword: string;

  constructor(private jwtService: JwtService) {
    this.demoUsername = process.env.DEMO_USERNAME || '';
    this.demoPassword = process.env.DEMO_PASSWORD || '';
  }

  async login(loginDto: LoginDto): Promise<string> {
    const { username, password } = loginDto;

    if (username !== this.demoUsername || password !== this.demoPassword) {
      console.log('[AuthService] Login failed - invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('[AuthService] Login successful');

    const payload = {
      sub: 'demo-user',
      name: this.demoUsername,
    };

    return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
