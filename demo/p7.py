"""Create a DataFrame with columns ['Name', 'City']. Access 
column "City" and display it """
import pandas as pd
data={"name":["Ekta","ayushi","aryan","arvind"],
     "city":["surat","ahemdabad","surat","ahemdabad"]}
df=pd.DataFrame(data)
print(df["city"])
