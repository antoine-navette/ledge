import type { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.js';

type LogoutInput = { refreshToken: string | undefined };

type LogoutOutput = void;

export class LogoutUseCase {
    constructor(private refreshTokenRepository: RefreshTokenRepository) {}

    execute = async (input: LogoutInput): Promise<LogoutOutput> => {
        if (!input.refreshToken) return;

        const refreshToken = await this.refreshTokenRepository.findByValue(input.refreshToken);
        if (!refreshToken) return;

        await this.refreshTokenRepository.delete(refreshToken);
    };
}
