import pandas as pd

df = pd.DataFrame({'Category': ['A', 'B', 'A', 'B'], 'Value': [10, 20, 30, 40]})
result = df.groupby("Category")["Value"].agg(["mean", "max", "min"])
print(result)
