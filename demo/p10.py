"""10.Create two DataFrames & Merge the two DataFrames(using merge())  
based on the 'ID' column. 
df1 = pd.DataFrame({'ID': [1, 2], 'Name': ['Krishna ', 'Arjun']}) 
df2 = pd.DataFrame({'ID': [1, 2], 'Age': [25, 30]}) """
import pandas as pd
df1 = pd.DataFrame({'ID': [1, 2], 'Name': ['Krishna ', 'Arjun']}) 
df2 = pd.DataFrame({'ID': [1, 2], 'Age': [25, 30]})
merge_df = pd.merge(df1,df2,on="ID")
print("marge data frame")
print(merge_df)
