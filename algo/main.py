import heapq
import dataclasses
import copy
import sys
max_choice = 5
swap_cost = 2
choice_cost = 15
rows = 2
cols = 3
init_arr = [
    [3, 0, 2], 
    [5 ,1, 4]
]

td = [0, -1, 0, 1]
tc = [1, 0, -1, 0]
ta = 'RULD'

visited = {}
dist = {}
trace = {}
pq = []

class State:
    def __init__(self, arr, choice_left, cur_piece):
        self.arr = arr
        self.choice_left = choice_left
        self.cur_piece = cur_piece # (row col)

    def __hash__(self):
        return hash(''.join([str(x) for x in self.__dict__.values()]))

    def __lt__(self, other):
        return False

    def is_end_state(self):
        for i in range(rows):
            for j in range(cols):
                if self.arr[i][j] != i*cols+j:
                    return False
        return True

    def get_neighbors(self):
        
        neighbors = []
        if self.cur_piece is not None:
            # swap
            r, c = self.cur_piece
            for k in range(4):
                nr = (r + td[k] + rows) % rows
                nc = (c + tc[k] + cols) % cols
                
                new_arr = copy.deepcopy(self.arr)
                new_arr[nr][nc], new_arr[r][c] = new_arr[r][c], new_arr[nr][nc]
                new_state = State(new_arr, self.choice_left, (nr, nc))
                hash_new_state = hash(new_state)

                if hash_new_state not in visited:
                    neighbors.append((new_state, swap_cost, ta[k]))
                    visited[hash_new_state] = True

        # change piece
        if self.choice_left > 0:
            for i in range(rows):
                for j in range(cols):
                    if self.cur_piece is not None and i == r and j == c:
                        continue
                    new_arr = copy.deepcopy(self.arr)
                    new_state = State(new_arr, self.choice_left-1, (i, j))
                    hash_new_state = hash(new_state)
                    if hash_new_state not in visited:
                        neighbors.append((new_state, choice_cost, f'C({i},{j})'))
                        visited[hash_new_state] = True


        return neighbors

    def heuristic(self):

        def h0():
            return 0;
        return h0()

def solve():
    init_state = State(init_arr, max_choice, None)
    hstate = hash(init_state)
    visited[hstate] = True
    dist[hstate] = 0
    trace[hstate] = None
    heuristic_cost = init_state.heuristic()
    heapq.heappush(pq, (dist[hstate]+heuristic_cost, init_state, None))

    # print(init_state.is_end_state())
    # sys.exit(0)

    solution = None
    while True:
        cost, state, action = heapq.heappop(pq)
        # print(cost, state.arr, action)
        if state.is_end_state():
            solution = state
            break
        hstate = hash(state)
        neighbors = state.get_neighbors()
        for nei, path_cost, action in neighbors:
            hnei = hash(nei)
            if hnei not in dist or dist[hnei] < dist[hstate] + path_cost:
                dist[hnei] = dist[hstate] + path_cost
                trace[hnei] = action, state
                heapq.heappush(pq, (dist[hnei] + nei.heuristic(), nei, action))

    hsol = hash(solution)
    true_cost = dist[hsol]
    path = []
    pathstates = []
    while trace[hsol] is not None:
        path.append(trace[hsol][0])
        pathstates.append(trace[hsol][1].arr)
        solution = trace[hsol][1]
        hsol = hash(solution)
    path = path[::-1]
    print(path, true_cost)
    for s in pathstates[::-1]:
        print(s)


solve()