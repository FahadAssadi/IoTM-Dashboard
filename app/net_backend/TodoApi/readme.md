### Prerequisites

- **.NET 8 SDK**: [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)

or use the following command to download it

```bash
brew install --cask dotnet-sdk
```

# Backend Setup

Restore the dependencies and the tools the first time using 

```bash
dotnet restore
```

Then run the backend server using

```bash
dotnet run
```
 
 This should return a localhost connection in the terminal that you can use to access the swagger UI which shows all the available API endpoints and allows you to debug them.