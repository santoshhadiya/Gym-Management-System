class Test:
    def hello(self):
        print("Hello!")

t = Test()
print(hasattr(t, 'hello'))   # True
print(hasattr(t, 'bye'))     # False
