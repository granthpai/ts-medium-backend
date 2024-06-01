import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import {withAccelerate} from '@prisma/extension-accelerate'
import {decode,sign,verify} from 'hono/jwt';

const app = new Hono<{//generics
  Bindings :{
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>()



app.post('/api/v1/user/signup', async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: body.password,
        name: body.name,
      },
    });
    const jwt = await sign({
      id: user.id
    },c.env.JWT_SECRET)
    return c.text(jwt);
  } catch (error) {
    c.status(411);
    return c.text('Invalid');
  }
});



  

app.post('/api/v1/user/signin', async(c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: body.username,
        password: body.password,
      },
    });
    if (!user){
      c.status(403);
      return c.text("Invalid")
    }
    const jwt = await sign({
      id: user.id
    },c.env.JWT_SECRET)
    return c.text(jwt);
  } catch (error) {
    c.status(411);
    return c.text('Invalid');
  }
})


app.post('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})


app.put('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})


app.get('/api/v1/blog/:id', (c) => {
  return c.text('Hello Hono!')
})


app.get('/api/v1/blog/blog', (c) => {
  return c.text('Hello Hono!')
})




export default app
