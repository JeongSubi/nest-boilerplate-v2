import {createParamDecorator, ExecutionContext} from '@nestjs/common'

export const Admin = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const admin = request.admin

  return data ? admin?.[data] : admin
})
