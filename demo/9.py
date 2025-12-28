class A:
    def method(self):
        print("Method in A")

class B:
    def method(self):
        print("Method in B")

class C(A, B):   # multiple inheritance
    pass

c = C()
c.method()   # follows MRO (A before B)
