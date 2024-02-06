import { Injectable } from '@nestjs/common';

@Injectable()
export class PostService {
    constructor() {}

    public async getList() {
        return [{ title: 'post 1' }, { title: 'post 2' }, { title: 'post 3' }, { title: 'post 4' }];
    }
}
