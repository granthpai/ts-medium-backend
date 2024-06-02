import {Hono} from "hono";
import { PrismaClient } from '@prisma/client/edge'
import {withAccelerate} from '@prisma/extension-accelerate'
import {decode,sign,verify} from 'hono/jwt';

export const blogRouter = new Hono<{
    Bindings:{
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables:{
        userID:string
    }
}>();

blogRouter.use("/*",async(c,next)=>{
    //extract userID
    //pass it to route handler
    const authHeader = c.req.header("authorization") || "";
    try {
        const user = await verify(authHeader,c.env.JWT_SECRET);

    if (user){
        c.set("userID",user.id);
        await next();
    } else {
        return c.json({
            message:"Your are not logged in"
        })
    }
    } catch (error) {
        c.status(403);
        return c.json({
            message:"you are not logged in"
        })
        
    }
    

})

blogRouter.post('/', async(c) => {
    const body = await c.req.json();
    const authorID = c.get("userID");
    const prisma = new PrismaClient({
        dataSourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.blog.create({
        data:{
            title: body.title,
            content:body.content,
            authorID: Number(authorID)
        }
    })
  return c.json({
    id: blog.id
  })
})


blogRouter.put('/',async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        dataSourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.blog.update({
        where:{
            id: body.id
        },
        data:{
            title: body.title,
            content:body.content,
        }
    })
  return c.json({
    id: blog.id
  })
})

blogRouter.get('/bulk', (c) => {
    const prisma = new PrismaClient({
        dataSourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blogs = prisma.blog.findMany();

    return c.json({
        blogs
    })
    
})



blogRouter.get('/:id', async(c) => {
    const id = await c.req.param('id');
    const prisma = new PrismaClient({
        dataSourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.blog.findFirst({
            where:{
                id: Number(id)
            }
        })

      return c.json({
        blog
      })
    } catch (error) {
        c.status(411);
        return c.json({
            message: "Error while fetching blog post"
        })   
    }
})

