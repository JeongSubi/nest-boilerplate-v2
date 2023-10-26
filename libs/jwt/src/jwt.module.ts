import {DynamicModule, Module, ModuleMetadata} from '@nestjs/common'
import {JwtService} from './jwt.service'

export interface JwtModuleOptions {
  privateKey: string
  publicKey: string
}

export interface JwtModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<JwtModuleOptions>
  inject?: any[]
}

@Module({})
export class JwtModule {
  static forRootAsync(options: JwtModuleAsyncOptions): DynamicModule {
    return {
      global: true,
      imports: options.imports,
      module: JwtModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject
        },
        JwtService
      ],
      exports: [JwtService]
    }
  }
}
