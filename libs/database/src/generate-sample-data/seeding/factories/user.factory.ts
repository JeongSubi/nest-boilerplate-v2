import { User } from '@entities/user.entity';
import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(User, (faker: Faker) => {
  const parameters = {
    /**
     * email login user - password: 'test123!'
     */
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    profileImage: faker.image.url(),
    salt: 'FPJ5RjB6yyeyiVIJ6e6xslY1qaNLMp4QYsf6PJszGykoI5NCvzcfv3n5JLqBmiLIJHnHmNpVBbqlsFEkO8A',
    password:
      '3ltfjY3cZ4Ph5H3BMglLnjWeIPsbTnn/fjYBrH0Shupby7DGJJQIHh/2G1iKERzxu0y2pfO2JtakXMnZfFcAJQ==',
  };

  const user: User = new User(parameters);

  return user;
});
