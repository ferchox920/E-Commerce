import { CallHandler, ExecutionContext,  NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response <T>{
    message:string
    success:boolean
    result:any
    error:any
    timeStamp: Date
    statusCode: number
}

export class TransformationInterception<T> implements NestInterceptor<T,Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;
    const path = context.switchToHttp().getResponse().url;

    return next.handle().pipe(
      map((data) => {
        return {
          message: data.message,
          success: data.success,
          result: data.result,
          timeStamp: new Date(),
          statusCode,
          path,
          error: null,
        };
      }),
    );
  }
}

