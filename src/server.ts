import app from "./app.js";
import "./utils/env.js";


const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`🎉 All good here! => Server listening on http://localhost:${PORT}🎉`);
});
