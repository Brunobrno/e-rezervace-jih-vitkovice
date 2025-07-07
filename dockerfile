# Use the official Python image from the Docker Hub
FROM python:3

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /code

# Copy the requirements file and install dependencies
COPY requirements.txt .

RUN pip install -r requirements.txt

RUN apt-get update && apt-get install -y ffmpeg



# Copy the project files
COPY . .
