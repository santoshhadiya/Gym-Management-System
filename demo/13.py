class Math:
    def add(self, a, b, c=0):
        return a + b + c


m = Math()
print(m.add(2, 3))       # sum of 2 numbers
print(m.add(2, 3, 4))    # sum of 3 numbers
