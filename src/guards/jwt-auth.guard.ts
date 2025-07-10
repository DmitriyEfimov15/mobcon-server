import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { TokensService } from "src/tokens/tokens.service";


@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor (
        private tokensService: TokensService
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if(!authHeader) {
            throw new UnauthorizedException('Нет токена');
        } 

        const token = authHeader.split(' ')[1]

        if (!token) {
            throw new Error('Некорретный токен авторизации')
        }

        return this.tokensService.validateAccessToken(token)
        .then(user => {
            if (!user) {
                throw new UnauthorizedException("Недействительный токен");
            }
            request.user = user;
            return true;
        })
        .catch(err => {
            throw new UnauthorizedException(`Ошибка авторизации: ${err.message}`);
        });
    }
}