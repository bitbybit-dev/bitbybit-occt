import {OCCT} from './inputs';

describe('OCCT Inputs', () => {
    test('CircleDto', ()=>{
        const cDto = new OCCT.CircleDto();

        expect(cDto.radius).toBe(1);
        expect(cDto.center).toMatchObject([0, 0, 0]);
        expect(cDto.direction).toMatchObject([0, 1, 0]);
    })

})