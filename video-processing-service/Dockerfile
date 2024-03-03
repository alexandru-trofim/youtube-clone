#Parent image Node runtime
FROM node:18

#Set the working directory in the container
WORKDIR /app

#Install ffmpeg in the container
RUN apt-get update && apt-get install -y ffmpeg

#Copy package.json and package-lock.json intor the working directory
COPY package*.json ./

#Install any needed packages specified in package.json
RUN npm install

#Copy app source code inside the docker image
COPY . .

#Make kport 3000 available outside this container
EXPOSE 3000

#Define the command to run your app using CMD 
CMD ["npm", "start"]