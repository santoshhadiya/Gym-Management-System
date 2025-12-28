"""Create a DataFrame with columns ['Name', 'Age', 'Score']. Sort 
the DataFrame based on the 'Score' column in descending order."""
import pandas as pd
data={"name":["Ekta","ayushi","aryan","arvind"],
     "age":[46,19,21,49],
     "score":[45,57,68,46]}
df=pd.DataFrame(data)
print("\n orignal data frame:\n",df)
df_sorted=df.sort_values(by="score",ascending=False)
print("\n dataframe sorted:\n",df_sorted)
